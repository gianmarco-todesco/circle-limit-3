


class Scene1 {

    init() {
        const {gl, viewer} = this;
        this.sdot1 = new Disk(gl, 0.01, 10);

        this.dot1 = viewer.createDraggableDot(0,0);
        this.dot2 = viewer.createDraggableDot(0.5,0.2);
        this.dot3 = viewer.createDraggableDot(0.6,0.1);
        this.dot4 = viewer.createDraggableDot(-0.3,0.6);
        this.dot5 = viewer.createDraggableDot(-0.4,0.5);
        this.hLine1 = new HLineMesh(gl, 50);
        this.hLine2 = new HLineMesh(gl, 50);
        this.hLine3 = new HLineMesh(gl, 50);
        
    }

    render() {
        const {dot1, dot2, dot3, dot4, dot5, hLine1, hLine2, hLine3} = this;
        hLine1.setByPoints(dot1.pos, dot2.pos);
        hLine2.setByPoints(dot1.pos, dot3.pos);
        hLine3.setByPoints(dot4.pos, dot5.pos);

        hLine1.material.setColor([0,0.5,1,1]);
        hLine1.draw();
        hLine2.draw();
        hLine3.material.setColor([0,0.7,0.7,1]);
        hLine3.draw();

        dot1.draw();
        dot2.draw();
        dot3.draw();
        dot4.draw();
        dot5.draw();
    }
}

class Scene2 {
    init() {
        const {gl, viewer} = this;
        this.dot1 = viewer.createDraggableDot(0.2,0.1);
        this.hPolygon = new HRegularPolygon(gl, 8, 0.5);
    }

    render() {
        const {gl, viewer, dot1, hPolygon} = this;

        hPolygon.setFirstVertex(dot1.pos);

        hPolygon.matrix = m4.identity();
        hPolygon.draw();

        hPolygon.matrix = hPolygon.getEdgeMatrix(0); //  hTranslation(0.3,0.4);
        hPolygon.draw();
        hPolygon.matrix = hPolygon.getEdgeMatrix(-1); //  hTranslation(0.3,0.4);
        hPolygon.draw();
        hPolygon.matrix = m4.identity();

        dot1.draw();
    }
}

class Scene3 {
    init() {
        const {gl, viewer} = this;
        let textureCanvas = this.textureCanvas = new OffscreenCanvas(1024,1024);
        this.textureCtx = textureCanvas.getContext('2d');
        this.textureCtx.fillStyle='transparent';
        this.textureCtx.fillRect(0,0,1024,1024);
    

        let disk = this.disk = new Disk(gl, 0.9999, 100);
        disk.material = new HyperbolicInvertedTexturedMaterial(gl);
        disk.material.uniforms.texture = twgl.createTexture(gl, {src: textureCanvas});
    }

    render() {
        const {gl, viewer, disk} = this;
        disk.draw();
        let matrix = hTranslation(-0.5,0.0);
        disk.material.uniforms.hModelMatrix = 
            m4.multiply(matrix, m4.multiply(m4.scaling([-1,1,1]), m4.inverse(matrix)));
        disk.draw();
        disk.material.uniforms.hModelMatrix = m4.identity();


        for(let i=1; i<10; i++) {
            disk.material.uniforms.hModelMatrix = m4.multiply(hTranslation(-0.3,0.0), disk.material.uniforms.hModelMatrix);
            disk.draw();

        }
        disk.material.uniforms.hModelMatrix = m4.identity();
    }

    onPointerDrag(e) {
        let x = 1024 * (0.5 + e.x * 0.5);
        let y = 1024 * (0.5 + e.y * 0.5);
        this.textureCtx.fillStyle='black';
        this.textureCtx.fillRect(x - 5, y - 5, 10, 10);
        this.disk.material.updateTexture(this.disk.material.uniforms.texture, this.textureCanvas);
    }
}


class Scene4 {
    init() {
        const {gl, viewer, disk} = this;
        let tess = this.tess = new GenericTessellation(8,3);
        tess.addFirstShell();
        for(let i=0;i<1;i++) tess.addShell();
        this.hPolygon = new HRegularPolygonOutlineMesh(gl, 8, tess.R, 60);
        this.hMatrix = m4.identity();
        

    }

    render() {
        this.hPolygon.material.uniforms.hViewMatrix = this.hMatrix;
        this.tess.cells.forEach(cell => {
            this.hPolygon.material.uniforms.hModelMatrix = cell.mat;
            this.hPolygon.draw();
        })
        this.hPolygon.material.uniforms.hModelMatrix = m4.identity();
        this.hPolygon.material.uniforms.hViewMatrix = m4.identity();
    }

    onPointerDrag(e) {
        this.hMatrix = m4.multiply(hTranslation(e.dx, e.dy), this.hMatrix);
        this.uffi();
    }

    uffi() {
        let startTime = performance.now();
        let bestMatrix = null;
        let closestDistance;
        for(let i=0; i<this.tess.n1; i++) {
            for(let j=0;j<this.tess.n2-1; j++) {
                let matrix = m4.multiply(this.hMatrix, this.tess.baseMatrices[i][j]);
                let p = pTransform(matrix, [0,0]);
                let d = getLength(p);
                if(bestMatrix == null || d < closestDistance) {
                    closestDistance = d;
                    bestMatrix = matrix;
                } 
            }
        }
        console.log("time = ", performance.now() - startTime);
        this.hMatrix = normalizeHMatrix(bestMatrix);
    }
}

