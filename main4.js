
let viewer;
let dot1, dot2;
let pos = {x:0, y:0}
let line;

function init(gl, viewer) {
    dot1 = new DraggableDot(viewer, pos.x, pos.y);
    dot2 = new DraggableDot(viewer, 0.5, 0.2);
    line = new Updatable(gl, 50);
}

function render(gl, viewer) {

    let t = performance.now()*0.001;

    line.material.setColor([1,1,1,1]);
    line.draw(); 
    dot1.draw();
    dot2.draw();
}

document.addEventListener('DOMContentLoaded', () => {
    viewer = new DiskViewer({ init, render, onPointerMove : (e) => {
        pos.x = e.x;
        pos.y = e.y;
        dot1.x = e.x;
        dot1.y = e.y;
    } });
    
});

  
