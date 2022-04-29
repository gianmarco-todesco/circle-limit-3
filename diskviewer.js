

class DiskViewer {
    constructor(options) {
        options = options || {};
        let canvasId = options.canvasId || "c";
        let canvas = this.canvas = document.getElementById(canvasId);
        if(!canvas) throw "Canvas not found:" + canvasId;
        let gl = this.gl = canvas.getContext("webgl");
        let renderFn = options.render || function(gl, viewer) {};
        let initFn = options.init || function(gl, viewer) {};
        
        let bgColor = options.bgColor || [0.7,0.75,0.8,1];
        gl.clearColor(...bgColor);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.createEntities();
        const viewer = this;

        this.onPointerDown = options.onPointerDown;
        this.onPointerUp   = options.onPointerUp;
        this.onPointerMove = options.onPointerMove;
        this.onPointerDrag = options.onPointerDrag;
        
        // call init
        initFn(gl, viewer);

        // animate function
        const animate = function(time) {
            // let t0 = performance.now();
            twgl.resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;    
            twgl.m4.ortho(-aspect, aspect, 1, -1, -1, 1, viewMatrix);
            viewer.entities.circle.material.setColor([0,0,0,1]);
            viewer.entities.circle.draw();
            renderFn(gl, viewer);
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);      
        this.handlePointerEvents(canvas);  
    }


    createEntities() {
        let gl = this.gl;
        let entities = this.entities = {};
        entities.circle = new Circle(gl, 1.02, 0.02, 100);
        let dotRadius = 0.02;        
        entities.dot = new Disk(gl, dotRadius, 30);
        entities.dotBorder = new Circle(gl, dotRadius, 0.005, 30);
    }

    pointerPosToWordPos(e) {
        let r = this.canvas.getBoundingClientRect();
        let x = 2*(e.clientX - r.x)/r.width-1;
        let y = 2*(e.clientY - r.y)/r.height-1;
        let p = twgl.m4.transformPoint(twgl.m4.inverse(viewMatrix), [x,y,0]);
        return [p[0],-p[1]]
    }

    handlePointerEvents(canvas) {   
        const me = this;
        this.buttonDown = false;
        canvas.onpointermove = e => {
            let p = me.pointerPosToWordPos(e);
            if(me.buttonDown) {
                let dx = p[0] - me.oldp[0];
                let dy = p[1] - me.oldp[1];
                me.oldp[0] = p[0];
                me.oldp[1] = p[1];                
                if(me.onPointerDrag) me.onPointerDrag({x:p[0], y:p[1], dx, dy, e});                          
            } else {
                if(me.onPointerMove) me.onPointerMove({x:p[0], y:p[1], e});
            }
        };

        canvas.onpointerdown = e => {
            let p = me.pointerPosToWordPos(e);
            me.oldp = p;
            canvas.setPointerCapture(e.pointerId);
            me.buttonDown = true;
            if(me.onPointerDown) me.onPointerDown({x:p[0], y:p[1], e});
        };

        canvas.onpointerup = e => {
            me.buttonDown = false;
            if(me.onPointerUp) me.onPointerUp(e);
        };
    };
}


class DraggableDot {
    constructor(viewer, x, y) {
        this.viewer = viewer;
        this.x = x;
        this.y = y;
        this.fillColor = [1,0,1,1];
        this.strokeColor = [0,0,0,1];        
    } 

    draw() {
        let dot = this.viewer.entities.dot;
        let dotBorder = this.viewer.entities.dotBorder;
        let material = dot.material;

        let mat = twgl.m4.translation([this.x, this.y,0.0]);
        twgl.v3.copy(this.fillColor, material.uniforms.color);
        let oldMat = material.uniforms.modelMatrix;
        material.uniforms.modelMatrix = mat;   
        dot.draw();
        twgl.v3.copy(this.strokeColor, material.uniforms.color);
        dotBorder.draw();
        material.uniforms.modelMatrix = oldMat;
    }

}