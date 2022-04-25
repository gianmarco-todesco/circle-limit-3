
class Tessellation {
    constructor() {
        this.baseMatrices = [];
        this.basePoints = [];
        for(let i=0; i<8; i++) {
            let phi = -2*Math.PI*(i)/8;
            let p = [Math.cos(phi)*R, Math.sin(phi)*R];
            this.basePoints.push(p);
            let tmat = hTranslation1(p[0], p[1]);
            let mat = m4.multiply(m4.inverse(tmat), 
                    m4.multiply(m4.rotationZ(-2*Math.PI/3), tmat));    
            this.baseMatrices.push(mat);
        }
        let perm = this.colorPermutations = [           
            [1,2,0,3], // ok
            [0,2,3,1], // ok
            [3,0,2,1], // ok
            [3,1,0,2], // ok                
        ];
        this.cells = [{ mat: m4.identity(), colors: [0,1,2,3]}];
        this.baseMatrices.forEach((mat,i) => {
            this.cells.push({mat, colors: perm[i%4]});
        });
        this.boundary = [];
        for(let i=0; i<8; i++) {
            let cell = this.cells[i+1]; 
            for(let j=2; j<7; j++) {
                let k = (i+j)%8;
                let p = pTransform(cell.mat, this.basePoints[k]);                
                this.boundary.push({
                    p, 
                    cell, 
                    j:k, 
                    type: j==2 ? 1 : 2
                })
            }            
        }
    }

    addShell() {
        let oldBoundary = this.boundary;
        let m = oldBoundary.length;
        this.boundary = [];
        let perm = this.colorPermutations;

        for(let i = 0; i<m; i++) {
            let b = oldBoundary[i];
            if(b.type == 1) continue;
            let matB = m4.multiply(b.cell.mat, tessellation.baseMatrices[b.j]);
            let permj = perm[b.j%4];
            let newCell = { mat:matB, colors: permj.map(t=>b.cell.colors[t])};
            this.cells.push(newCell);
            let t0 = oldBoundary[(i+m-1)%m].type == 1 ? 3 : 2;
            for(let t = t0; t < 7; t++) {
                let k = (t+b.j)%8;
                let p = pTransform(matB, this.basePoints[k]);
                this.boundary.push({p, cell:newCell, j:k, type: t==t0 ? 1 : 2})
            }
        }

    }

}
