
let viewer;
let dot1, dot2, dot3, dot4;
let pos = {x:0, y:0}
let hLine1, hLine2;
let hSegment;

function init(gl, viewer) {

    dot1 = viewer.createDraggableDot(0,0);
    dot2 = viewer.createDraggableDot(0.5,0.2);
    dot3 = viewer.createDraggableDot(0.6,0.1);
    dot4 = viewer.createDraggableDot(-0.3,0.6);
    hLine1 = new HLineMesh(gl, 50);
    hLine2 = new HLineMesh(gl, 50);
    
    hLine1.setByPoints(dot1.pos, dot2.pos);
    hLine2.setByPoints(dot1.pos, dot3.pos);

    hSegment = new HSegmentMesh(gl, 50, dot3.pos, dot4.pos);
    
}

function render(gl, viewer) {

    let t = performance.now()*0.001;

    hLine1.setByPoints(dot1.pos, dot2.pos);
    hLine2.setByPoints(dot1.pos, dot3.pos);
    hSegment.setEnds(dot3.pos, dot4.pos);

    hLine1.material.setColor([1,1,1,1]);
    hLine1.draw(); 
    hLine2.material.setColor([1,0,1,1]);
    hLine2.draw(); 

    hSegment.material.setColor([0,1,0,1]);
    hSegment.draw();
    dot1.draw();
    dot2.draw();
    dot3.draw();
    dot4.draw();
}

document.addEventListener('DOMContentLoaded', () => {
    viewer = new DiskViewer({ init, render 
        
    });
    
});

  
