let currentMaterial = null;
const viewMatrix = twgl.m4.identity();
const modelMatrix = twgl.m4.identity();
const hViewMatrix = twgl.m4.identity();

let simpleMaterial;
let simpleHyperbolicMaterial;

// -----------------------------
// Material
// -----------------------------
class Material {
    constructor(gl, options) {
        this.gl = gl;
        let vs = options.vs;
        let fs = options.fs;
        this.uniforms = options.uniforms;
        this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);          
    }

    setUniforms() {
        twgl.setUniforms(this.programInfo, this.uniforms);  
    }
    bind() {
        if(currentMaterial != this) {
            currentMaterial = this;
            this.gl.useProgram(this.programInfo.program);
        }        
        twgl.setUniforms(this.programInfo, this.uniforms);
    }
};



// -----------------------------
// SimpleMaterial
// -----------------------------
class SimpleMaterial extends Material {
    constructor(gl) {
        super(gl, {
            vs : `
            precision mediump float;
            attribute vec2 position;
            uniform mat4 viewMatrix, modelMatrix;
            void main(void) { 
                gl_Position = viewMatrix * modelMatrix * vec4(position, 0.0, 1.0); 
            }
            `,
            fs:`
            precision mediump float;            
            uniform vec4 color;        
            void main() {
                gl_FragColor = color; 
            } 
            `,
            uniforms: {
                color: [0.0,0.0,0.0,1.0],
                viewMatrix: viewMatrix,
                modelMatrix: modelMatrix
            }
        });
    }
    setColor(rgba) {
        for(let i=0;i<4;i++) this.uniforms.color[i] = rgba[i];        
    }
    setModelMatrix(matrix) {
        this.modelMatrix = matrix;
    }
};


// obsoleto?
class HyperbolicMaterial extends Material {
    constructor(gl) {
        super(gl, {
            vs : `
            precision mediump float;
            attribute vec2 position;
            uniform mat4 hViewMatrix;
            uniform mat4 hMatrix;
            uniform mat4 viewMatrix;
            

            // poincaré to hyperboloid
            vec4 p2h(vec2 p) { 
                float t = 2.0/(1.0-(p.x*p.x+p.y*p.y)); 
                return vec4(t*p.x,t*p.y,t-1.0,1.0); 
            }
            // hyperboloid to poincaré
            vec2 h2p(vec4 p) {
                float d = 1.0/(p.w + p.z);
                return vec2(p.x*d, p.y*d);
            }

            void main(void) { 
                vec4 p = p2h(position);
                vec2 q = h2p(hViewMatrix * hMatrix * p);
                gl_Position = viewMatrix * vec4(q, 0.0, 1.0); 
            }
            `,
            fs:`
            precision mediump float;            
            uniform vec4 color;            
            void main() { gl_FragColor = color; }
            `,
            uniforms: {
                color: [0.0,0.0,0.0,1.0],
                viewMatrix: viewMatrix,
                hMatrix: twgl.m4.identity(),
                hViewMatrix: twgl.m4.identity()
            }
        });
    }

};


class SimpleHyperbolicMaterial extends Material {
    constructor(gl) {
        super(gl, {
            vs : `
            precision mediump float;
            attribute vec2 position;
            uniform mat4 hViewMatrix;
            uniform mat4 hModelMatrix;
            uniform mat4 viewMatrix;
            
            // poincaré to hyperboloid
            vec4 p2h(vec2 p) { 
                float t = 2.0/(1.0-(p.x*p.x+p.y*p.y)); 
                return vec4(t*p.x,t*p.y,t-1.0,1.0); 
            }
            // hyperboloid to poincaré
            vec2 h2p(vec4 p) {
                float d = 1.0/(p.w + p.z);
                return vec2(p.x*d, p.y*d);
            }

            void main(void) { 
                vec4 p = p2h(position);
                vec2 q = h2p(hViewMatrix * hModelMatrix * p);
                gl_Position = viewMatrix * vec4(q, 0.0, 1.0); 
            }
            `,
            fs:`
            precision mediump float;            
            uniform vec4 color;
            
            void main() {
                gl_FragColor = color; 
            } 
            `,
            uniforms: {
                color: [0.0,0.0,0.0,1.0],
                viewMatrix: viewMatrix,
                hModelMatrix: twgl.m4.identity(),
                hViewMatrix: twgl.m4.identity(),
            }
        });
    }
    setColor(rgba) {
        for(let i=0;i<4;i++) this.uniforms.color[i] = rgba[i];        
    }
};



function getSimpleMaterial(gl) {
    if(!simpleMaterial) simpleMaterial = new SimpleMaterial(gl);
    return simpleMaterial;
}

function getSimpleHyperbolicMaterial(gl) {
    if(!simpleHyperbolicMaterial) simpleHyperbolicMaterial = new SimpleHyperbolicMaterial(gl);
    return simpleHyperbolicMaterial;
}
