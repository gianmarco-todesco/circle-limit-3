let canvas;
let gl;
const m4 = twgl.m4;

let bicolorCellMesh;
let palette = [0,1,2,3];

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.querySelector("#c");
    gl = canvas.getContext("webgl");
    initialize();
});

  
// sin(pi/24)/sqrt(sin(pi5/6)^2-sin(pi/8)^2)
const R = 0.4056164008015163;

let tessellation;

function initialize() {
    requestAnimationFrame(render);   

    circle = new Circle(gl, 1.02, 100, 0.02);
    dot = new Dot(gl, 0.01, 20);

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
    handlePointerEvents(canvas);
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
    
    let colors = [
        [0.53,0.52,0.28,1],
        [0.73,0.53,0.16,1],
        [0.50,0.21,0.13,1],
        [0.17,0.32,0.35,1]        
    ];
    colors = colors.map(v => v.map(x => x*3.0));


    tessellation.cells.forEach(cell => {
        let uniforms = cell2Mesh.material.uniforms;

        uniforms.hmatrix = cell.mat;
        uniforms.color1 = colors[palette[cell.colors[0]]];
        uniforms.color2 = colors[palette[cell.colors[1]]];
        
        let r = 0.5*Math.pow(ugh(cell.mat) - 0.5, 0.05);
        
        uniforms.color2 = [r,r,r,1.0];

        cell2Mesh.draw();        
    })
    
    /*

    tessellation.cells.forEach(cell => {
        let uniforms = cellMesh.material.uniforms;

        uniforms.hmatrix = cell.mat;
        uniforms.color1 = colors[palette[cell.colors[0]]];
        uniforms.color2 = colors[palette[cell.colors[1]]];
        
        cellMesh.draw();        
    })
    */
    tessellation.cells.forEach(cell => {
        let uniforms = t83ColorLineMesh.material.uniforms;

        uniforms.hmatrix = cell.mat;
        uniforms.color1 = colors[palette[cell.colors[0]]];
        uniforms.color2 = colors[palette[cell.colors[1]]];
        
        t83ColorLineMesh.draw();        
    })
    
    
    let dt = performance.now() - t0;
    window.dt = dt;
    requestAnimationFrame(render);
}


document.addEventListener('keydown', e => {
    console.log(e.code);
});

let cx=0,cy=0;

function onDrag(dx, dy) {
    cx += dx*0.001;
    cy += dy*0.001;
    cellMesh.material.uniforms.hViewMatrix = hTranslation1(-cx,-cy);
    cell2Mesh.material.uniforms.hViewMatrix = hTranslation1(-cx,-cy);
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