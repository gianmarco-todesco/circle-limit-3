let canvas;
let gl;
const m4 = twgl.m4;



document.addEventListener('DOMContentLoaded', () => {
    canvas = document.querySelector("#c");
    gl = canvas.getContext("webgl");
    initialize();
});

  
let tessellation;
let ptIndex = 0; 

function initialize() {
    requestAnimationFrame(render);   

    circle = new Circle(gl, 1.02, 100, 0.02);
    dot = new Dot(gl, 0.005, 20);

    tessellation = new GenericTessellation(6,4);
    tessellation.addFirstShell();
    tessellation.addShell();
    polygonOutline = new HyperbolicPolygonOutline(gl, tessellation.n1, tessellation.R);
    /*
    cellMesh = new CellMesh(gl, R);
    cell2Mesh = new Cell2Mesh(gl, R);
    t83ColorLineMesh = new T83ColorLinesMesh(gl, R);

    let t = performance.now();
    tessellation = new Tessellation();
    for(let it=0; it<5; it++) { // 5
        tessellation.addShell();
    }
    console.log(performance.now() - t);
    console.log(tessellation.cells.length)
    */
    handlePointerEvents(canvas);
}

function uff(n,m) {
    tessellation = new GenericTessellation(n,m);
    tessellation.addFirstShell();
    // tessellation.addShell();
    
    polygonOutline = new HyperbolicPolygonOutline(gl, tessellation.n1, tessellation.R);
    ptIndex = 0;
}

function ugh(mat) {
    let p = m4.transformPoint(mat, [0,0,1]);        
    let r = 1/(1.0+Math.sqrt(p[0]*p[0] + p[1]*p[1]) / p[2]);
    return r;
}

function render(time) {
    let t0 = performance.now();
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.6, 0.6, 0.6, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;    
    m4.ortho(-aspect, aspect, 1, -1, -1, 1, viewMatrix);

    // draw circle boundary
    circle.material.uniforms.color = [0,0,0,1];
    circle.draw();
    
    let mesh = polygonOutline;
    tessellation.cells.forEach(cell => {
        let uniforms = mesh.material.uniforms;

        uniforms.hMatrix = cell.mat;
        
        mesh.draw();        
    })
    
    if(0<=ptIndex && ptIndex < tessellation.boundary.length) {
        let pt = tessellation.boundary[ptIndex];
        p = pt.p;
        dot.material.uniforms.color = pt.type == 1 ? [1,0,0,1] : [0,1,1,1];
        dot.material.uniforms.modelMatrix = m4.translation([p[0],p[1],0.0]);
        dot.draw();
    
        dot.material.uniforms.color = [1,0,1,1];
        p = pTransform(pt.cell.mat, [0,0]); 
        dot.material.uniforms.modelMatrix =  m4.translation([p[0],p[1],0.0]);
        dot.draw();
    
        dot.material.uniforms.modelMatrix = m4.identity();
    
    }

    requestAnimationFrame(render);
}


document.addEventListener('keydown', e => {
    console.log(e.code);
    if(e.code == "ArrowRight") {
        ptIndex = (ptIndex+1)%tessellation.boundary.length;
        console.log(tessellation.boundary[ptIndex])
    } else if(e.code == "ArrowLeft") {
        ptIndex = (ptIndex+tessellation.boundary.length-1)%tessellation.boundary.length;
        console.log(tessellation.boundary[ptIndex])
    }
        
});

let cx=0,cy=0;

function onDrag(dx, dy) {
    cx += dx*0.001;
    cy += dy*0.001;
    // hViewMatrix = hTranslation1(-cx,-cy);
    //cellMesh.material.uniforms.hViewMatrix = hTranslation1(-cx,-cy);
    //cell2Mesh.material.uniforms.hViewMatrix = hTranslation1(-cx,-cy);
}

function handlePointerEvents(canvas) {
    canvas.onpointerdown = e => {
        let oldx = e.clientX;
        let oldy = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.onpointermove = e => {
            // console.log(e);
            let dx = e.clientX - oldx;
            let dy = e.clientY - oldy;
            oldx = e.clientX;
            oldy = e.clientY;
            onDrag(dx,dy);            
        }
        canvas.onpointerup = e => {
            canvas.onpointermove = null;
            canvas.onpointerup = null;
            // console.log("release")
        };
    };
}