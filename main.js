let canvas;
let gl;
const m4 = twgl.m4;
// let hMaterial, hMaterial2;
let circle, dot;
let multiOctagon;
let cellMesh;
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

    /*
    const textures = twgl.createTextures(gl, {
        texture1: { src: "images/texture1.png" }});


    simpleMaterial = new SimpleMaterial(gl);
    hMaterial = new HyperbolicMaterial(gl);
    hMaterial2 = new HyperbolicTexturedMaterial(gl);
    hMaterial2.texture1 = textures.texture1;
    */


    circle = new Circle(gl, 1.02, 100, 0.02);
    dot = new Dot(gl, 0.01, 20);
    multiOctagon = new MultiPolygon(gl, R,8);
    cellMesh = new CellBgMesh(gl, R + 0.09);

    let t = performance.now();
    tessellation = new Tessellation();
    for(let it=0; it<5; it++) { // 5
        tessellation.addShell();
    }
    console.log(performance.now() - t);
    console.log(tessellation.cells.length)
    //tessellation.addShell();
    //tessellation.addShell();
    handlePointerEvents(canvas);
}

function drawDot(x,y) {
    let oldMatrix = dot.material.uniforms.modelMatrix;
    dot.material.uniforms.modelMatrix = 
        m4.translation([x,y,0.0]);
    dot.draw();
    dot.material.uniforms.modelMatrix = oldMatrix;
    
}

let ptIndex = 0;


function render(time) {
    let t0 = performance.now();
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.clearColor(0.6, 0.6, 0.6, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;    
    m4.ortho(-aspect, aspect, 1, -1, -1, 1, viewMatrix);

    // draw circle boundary
    circle.material.uniforms.color = [0,0,0,1];
    circle.draw();


    //hMaterial2.uniforms.hmatrix = m4.identity();
    //hMaterial2.enable();
    //hMaterial2.uniforms.color = [1,1,1,1];
    
    let colors = [
        [0.53,0.52,0.28,1],
        [0.73,0.53,0.16,1],
        [0.50,0.21,0.13,1],
        [0.17,0.32,0.35,1]        
    ];
    colors = colors.map(v => v.map(x => x*3.0));
    tessellation.cells.forEach(cell => {
        let uniforms = cellMesh.material.uniforms;

        uniforms.hmatrix = cell.mat;
        uniforms.color1 = colors[palette[cell.colors[0]]];
        uniforms.color2 = colors[palette[cell.colors[1]]];
        
        cellMesh.draw();        
    })

    let dt = performance.now() - t0;
    window.dt = dt;
    requestAnimationFrame(render);
}


function glub(i) {
    let phi = -2*Math.PI*i/8;
    let p = [Math.cos(phi)*R, Math.sin(phi)*R];
    let tmat = hTranslation1(p[0], p[1]);
    let mat = m4.multiply(m4.inverse(tmat), 
            m4.multiply(m4.rotationZ(-2*Math.PI/3), tmat));    
    hMaterial2.uniforms.hViewMatrix = 
    m4.multiply(hMaterial2.uniforms.hViewMatrix,
        mat);
    palette = tessellation.colorPermutations[i%4].map(j=>palette[j]);

}


document.addEventListener('keydown', e => {
    console.log(e.code);
    /*
    if(e.code == "ArrowRight") {
        ptIndex = (ptIndex+1)%tessellation.boundary.length;
    } else if(e.code == "ArrowLeft") {
        ptIndex = (ptIndex+tessellation.boundary.length-1)%tessellation.boundary.length;
    }
    */
    if(e.code == "Digit1") {
        let phi = -2*Math.PI*(0)/8;
        let p = [Math.cos(phi)*R, Math.sin(phi)*R];
        let tmat = hTranslation1(p[0], p[1]);
        let mat = m4.multiply(m4.inverse(tmat), 
                m4.multiply(m4.rotationZ(-2*Math.PI/3), tmat));    
        


        hMaterial2.uniforms.hViewMatrix = 
            m4.multiply(hMaterial2.uniforms.hViewMatrix,
                mat);
    }
});

let cx=0,cy=0;

function onDrag(dx, dy) {
    cx += dx*0.001;
    cy += dy*0.001;
    let tmp = hTranslation1(-cx,-cy);
    for(let i=0;i<16;i++) hViewMatrix[i]=tmp[i];
    console.log(dt);
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