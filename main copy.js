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
        texture1: { src: "images/texture1.png" }});


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

    hMaterial.uniforms.color = [0,1,1,1];
    let d = 0.9;
    let csh = Math.cosh(2*d);
    let snh = Math.sinh(2*d);

    let colors = [
        [0,1,0,1],
        [0.756,0.534,0.145,1],
        [1,0.0,0.0,1],
        [0,0.5,0.0,1]        
    ];
    tessellation.cells.forEach(cell => {
        hMaterial.uniforms.hmatrix = cell.mat;
        hMaterial.uniforms.color = [0.5,0.5,0.5,1.0]
        hMaterial.uniforms.color1 = colors[cell.colors[0]];
        hMaterial.uniforms.color2 = colors[cell.colors[1]];
        
        hMaterial.setUniforms();

        // multiOctagon.draw(hMaterial);
        cellMesh.draw(hMaterial2);        
    })

    let dt = performance.now() - t0;
    window.dt = dt;
    requestAnimationFrame(render);
}

function render_old(time) {
    let t0 = performance.now();
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.clearColor(0.6, 0.6, 0.6, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;    
    m4.ortho(-aspect, aspect, 1, -1, -1, 1, viewMatrix);


    simpleMaterial.uniforms.color = [0,0,0,1];
    simpleMaterial.enable();
    
    circle.draw(simpleMaterial);

    dot.draw(simpleMaterial);
    simpleMaterial.uniforms.color = [1,0,0,1]

    let r = R;
    let x0 = r, y0 = 0.0;
    let x1 = Math.cos(2*Math.PI/8)*r, y1 = Math.sin(2*Math.PI/8)*r;
    //drawDot(x0,y0);
    //drawDot(x1,y1);
    simpleMaterial.uniforms.color = [0,1,0,1];
    simpleMaterial.setUniforms();

    /*
    k0 = p2k([x0,y0]);
    k1 = p2k([x1,y1]);
    let m = 10;
    for(let j=1;j<m;j++) {
        let t = j/m;
        let k = [k0[0]*(1-t)+k1[0]*t, k0[1]*(1-t)+k1[1]*t];
        let p = k2p(k);
        drawDot(p[0],p[1]);
    }
    

    simpleMaterial.uniforms.color = [0,0,0,1]
    simpleMaterial.setUniforms();
    */



    hMaterial.uniforms.color = [1,0,1,1];
    hMaterial.uniforms.hmatrix = m4.identity();
    // hMaterial.uniforms.hViewMatrix = hTranslation1(Math.cos(time*0.001)*0.8,0.0);
    hMaterial.enable();
    // multiOctagon.draw(hMaterial);

    hMaterial.uniforms.color = [0,1,1,1];
    let d = 0.9;
    let csh = Math.cosh(2*d);
    let snh = Math.sinh(2*d);

    let colors = [
        [0,1,0,1],
        [1,1,0,1],
        [1,0.0,0.0,1],
        [0,0.5,0.0,1]        
    ];
    tessellation.cells.forEach(cell => {
        hMaterial.uniforms.hmatrix = cell.mat;
        hMaterial.uniforms.color = [0.5,0.5,0.5,1.0]
        hMaterial.uniforms.color1 = colors[cell.colors[0]];
        hMaterial.uniforms.color2 = colors[cell.colors[1]];
        
        hMaterial.setUniforms();

        // multiOctagon.draw(hMaterial);
        cellMesh.draw(hMaterial);        
    })
    /*
    for(let i=0; i<8; i++) {
        hMaterial.uniforms.hmatrix = tessellation.baseMatrices[i];
        hMaterial.setUniforms();
        multiOctagon.draw(hMaterial);
    }
    */

    simpleMaterial.uniforms.color = [0,1,1,1];
    simpleMaterial.enable();
    let p1 = tessellation.basePoints[0];
    drawDot(p1[0],p1[1])

    let p2 = tessellation.basePoints[2];
    drawDot(p2[0],p2[1])

    let p3 = pTransform(
        tessellation.baseMatrices[0],
        tessellation.basePoints[6]);
    drawDot(p3[0],p3[1]);

    let arc = getCircleArc(p1,p2,p3);
    m = 30;
    for(let i=0; i<m; i++) {
        p = arc(i/m);
        drawDot(p[0],p[1])
    }

    
    /*
    let bm = tessellation.boundary.length;
    let b = tessellation.boundary[ptIndex];

    if(b.type == 2) {
        hMaterial.uniforms.color = [1,0,1,1];
        let matB = hMaterial.uniforms.hmatrix = m4.multiply(
            b.mat,
            tessellation.baseMatrices[b.j]);
        hMaterial.setUniforms();
        multiOctagon.draw(hMaterial);
    
    
        simpleMaterial.uniforms.color = [1,0,0,1];
        simpleMaterial.enable();
        let p = b.p;
        drawDot(p[0],p[1])
        simpleMaterial.uniforms.color = [0,1,0,1];
        simpleMaterial.setUniforms();
        
        let t0 = tessellation.boundary[(ptIndex+bm-1)%bm].type == 1 ? 3 : 2;
        for(let t = t0; t < 7; t++) {
            let p1 = pTransform(matB, tessellation.basePoints[(t+b.j)%8]);
            drawDot(p1[0],p1[1])
        }
    
    } else {
        simpleMaterial.uniforms.color = [1,0,0,1];
        simpleMaterial.enable();
        let p = b.p;
        drawDot(p[0],p[1])
    }
    //p = tessellation.basePoints[ptIndex];
    //drawDot(p[0],p[1])
    */


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