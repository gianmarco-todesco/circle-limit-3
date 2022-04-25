let canvas;
let gl;
const m4 = twgl.m4;
const viewMatrix = m4.identity();
let currentMaterial = null;
let simpleMaterial, hMaterial, hMaterial2;
let circle, dot;
let multiOctagon;
let cellMesh;

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

    const textures = twgl.createTextures(gl, {
        texture1: { src: "images/texture2.png" }});


    simpleMaterial = new SimpleMaterial(gl);
    hMaterial = new HyperbolicMaterial(gl);
    hMaterial2 = new HyperbolicTexturedMaterial(gl);
    hMaterial2.texture1 = textures.texture1;

    circle = new Circle(gl, 1.02, 100, 0.02);
    dot = new Dot(gl, 0.01, 20);
    multiOctagon = new MultiPolygon(gl, R,8);
    cellMesh = new CellBgMesh(gl, R);
    let t = performance.now();
    tessellation = new Tessellation();
    for(let it=0; it<0; it++) { // 5
        tessellation.addShell();
    }
    console.log(performance.now() - t);
    console.log(tessellation.cells.length)
    //tessellation.addShell();
    //tessellation.addShell();
    handlePointerEvents(canvas);
}

function drawDot(x,y) {
    let oldMatrix = simpleMaterial.uniforms.modelMatrix;
    simpleMaterial.uniforms.modelMatrix = 
        m4.translation([x,y,0.0]);
    simpleMaterial.setUniforms();
    dot.draw(simpleMaterial);
    simpleMaterial.uniforms.modelMatrix = oldMatrix;
    simpleMaterial.setUniforms();
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

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;    
    m4.ortho(-aspect, aspect, 1, -1, -1, 1, viewMatrix);

    // draw circle boundary
    simpleMaterial.uniforms.color = [0,0,0,1];
    simpleMaterial.enable();
    circle.draw(simpleMaterial);

    hMaterial2.uniforms.hmatrix = m4.identity();
    hMaterial2.enable();

    hMaterial2.uniforms.color = [1,1,1,1];
    
    let colors = [
        [0,1,0,1],
        [0.756,0.534,0.145,1],
        [1,0.0,0.0,1],
        [0,0.5,0.0,1]        
    ];
    tessellation.cells.forEach(cell => {
        hMaterial2.uniforms.hmatrix = cell.mat;
        //hMaterial.uniforms.color = [0.5,0.5,0.5,1.0]
        //hMaterial.uniforms.color1 = colors[cell.colors[0]];
        //hMaterial.uniforms.color2 = colors[cell.colors[1]];
        
        hMaterial2.setUniforms();
        cellMesh.draw(hMaterial2);        
    })

    let dt = performance.now() - t0;
    window.dt = dt;
    requestAnimationFrame(render);
}



document.addEventListener('keydown', e => {
    console.log(e.code);
    if(e.code == "ArrowRight") {
        ptIndex = (ptIndex+1)%tessellation.boundary.length;
    } else if(e.code == "ArrowLeft") {
        ptIndex = (ptIndex+tessellation.boundary.length-1)%tessellation.boundary.length;
    }
});

let cx=0,cy=0;

function onDrag(dx, dy) {
    cx += dx*0.001;
    cy += dy*0.001;
    hMaterial2.uniforms.hViewMatrix = hTranslation1(-cx,-cy);
    hMaterial2.setUniforms();
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