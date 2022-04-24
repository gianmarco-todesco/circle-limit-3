

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
    enable() {
        this.gl.useProgram(this.programInfo.program);        
        twgl.setUniforms(this.programInfo, this.uniforms);    
        currentMaterial = this;    
    }
};

class Mesh {
    constructor(gl, verb) {
        this.gl = gl;
        this.verb = verb;
    }

    createBufferInfo(attributes) {
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, attributes);
    }

    draw(material) {
        if(currentMaterial !== material) material.enable();
        twgl.setBuffersAndAttributes(this.gl, material.programInfo, this.bufferInfo);
        twgl.drawBufferInfo(this.gl, this.bufferInfo, this.verb); 
  
    }
};

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
            
            // varying vec2 texcoord;
            // uniform sampler2D texture;
            uniform vec4 color;
            
            void main() {
            gl_FragColor = color; 
            } 
            `,
            uniforms: {
                color: [0.0,0.0,0.0,1.0],
                viewMatrix: viewMatrix,
                modelMatrix: m4.identity()
            }

        });
    }
};


class HyperbolicMaterial extends Material {
    constructor(gl) {
        super(gl, {
            vs : `
            precision mediump float;
            attribute vec2 position;
            attribute vec2 texcoord;

            uniform mat4 hViewMatrix;
            uniform mat4 hmatrix;
            uniform mat4 viewMatrix;
            varying vec2 v_texcoord;
            

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
                vec2 q = h2p(hViewMatrix * hmatrix * p);
                v_texcoord = texcoord; 
                gl_Position = viewMatrix * vec4(q, 0.0, 1.0); 
            }
            `,
            fs:`
            precision mediump float;
            
            varying vec2 v_texcoord;
            // uniform sampler2D texture;
            uniform vec4 color;
            uniform vec4 color1;
            uniform vec4 color2;
            
            void main() {
                if(v_texcoord.x > 0.0) {
                    if(v_texcoord.y > 0.0)
                        gl_FragColor = color1;
                    else
                        gl_FragColor = color2;

                }
                else
                    gl_FragColor = color; 
            } 
            `,
            uniforms: {
                color: [0.0,0.0,0.0,1.0],
                viewMatrix: viewMatrix,
                hmatrix: m4.identity(),
                hViewMatrix: m4.identity(),
                color1: [1.0,1.0,1.0,1.0],
                color2: [1.0,1.0,1.0,1.0],
                
            }

        });
    }
};

class Circle extends Mesh {
    constructor(gl,r, m, thickness) {
        super(gl, gl.TRIANGLE_STRIP);
        const attributes = { position: { data: [], numComponents: 2 } };    
        let r0 = r-thickness;
        let r1 = r+thickness;
        for(let i=0;i<m;i++) {
            let phi = 2*Math.PI*i/(m-1);
            let cs = Math.cos(phi), sn = Math.sin(phi);
            attributes.position.data.push(cs*r1,sn*r1,cs*r0,sn*r0);
        }
        this.createBufferInfo(attributes);
    }  
};

class Dot extends Mesh {
    constructor(gl,r, m) {
        super(gl, gl.TRIANGLE_FAN);
        const attributes = { position: { data: [], numComponents: 2 } };    
        attributes.position.data.push(0.0, 0.0);
        for(let i=0;i<m;i++) {
            let phi = 2*Math.PI*i/(m-1);
            let cs = Math.cos(phi), sn = Math.sin(phi);
            attributes.position.data.push(cs*r,sn*r);
        }
        this.createBufferInfo(attributes);
    }  
};


class MultiPolygon extends Mesh {
    constructor(gl,r, m) {
        super(gl, gl.LINE_STRIP);
        const attributes = { 
            position: { data: [], numComponents: 2 }
         };
        for(let j=0;j<=m;j++) {
            let phi = -2*Math.PI*j/m;
            let cs = Math.cos(phi), sn = Math.sin(phi);
            attributes.position.data.push(cs*r,sn*r);
        }
        let r1 = r * 0.8;
        let phi = -2*Math.PI*(m-0.5)/m;
        let cs = Math.cos(phi), sn = Math.sin(phi);
        attributes.position.data.push(cs*r1,sn*r1);

        this.createBufferInfo(attributes);
    }  
};

class CellMesh extends Mesh {
    constructor(gl,r) {
        const m = 8;
        super(gl, gl.LINES);
        const attributes = { 
            position: { data: [], numComponents: 2 },
            texcoord: { data: [], numComponents: 2 }
        };
        let coords = [];
        for(let j=0;j<m;j++) {
            let phi = -2*Math.PI*j/m;
            coords.push(r*Math.cos(phi), r*Math.sin(phi));
        }
        function addPoint(j, u, v) {
            attributes.position.data.push(coords[j*2], coords[j*2+1]);
            attributes.texcoord.data.push(u,v);
        }
        for(let j=0;j<m;j++) { 
            addPoint(j%m, 0,0); 
            addPoint((j+1)%m, 0,0); 
        }
        addPoint(0,1,0);
        addPoint(2,1,0);
        addPoint(4,1,0);
        addPoint(6,1,0);
        
        addPoint(2,1,1);
        addPoint(4,1,1);
        addPoint(6,1,1);
        addPoint(0,1,1);
        


        this.createBufferInfo(attributes);
    }  
};


class CellBgMesh extends Mesh {
    constructor(gl,r) {
        const m = 8;
        super(gl, gl.TRIANGLE_FAN);
        const attributes = { 
            position: { data: [], numComponents: 2 },
        };
        attributes.position.data.push(0,0);
        let n = 10;
        
        let coords = [];
        for(let j=0;j<m;j++) {
            let phi = -2*Math.PI*j/m;
            coords.push(r*Math.cos(phi), r*Math.sin(phi));
        }
        function addPoint(j, u, v) {
            attributes.position.data.push(coords[j*2], coords[j*2+1]);
            attributes.texcoord.data.push(u,v);
        }
        for(let j=0;j<m;j++) { 
            addPoint(j%m, 0,0); 
            addPoint((j+1)%m, 0,0); 
        }
        addPoint(0,1,0);
        addPoint(2,1,0);
        addPoint(4,1,0);
        addPoint(6,1,0);
        
        addPoint(2,1,1);
        addPoint(4,1,1);
        addPoint(6,1,1);
        addPoint(0,1,1);
        


        this.createBufferInfo(attributes);
    }  
};

