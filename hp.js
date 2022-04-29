
function hTranslation(dx, dy) {
    let d = Math.sqrt(dx*dx+dy*dy);
    let phi = -Math.atan2(dy,dx);
    let cs = Math.cos(phi);
    let sn = Math.sin(phi);
    let h = 2 * Math.atanh(d);
    let csh = Math.cosh(h);
    let snh = Math.sinh(h);
    return twgl.m4.multiply(
        [
            cs,-sn, 0.0, 0.0,
            sn, cs, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ],
        twgl.m4.multiply(
            [csh,0,-snh,0, 0,1,0,0, -snh,0,csh,0,0,0,0,1],
            [
                cs, sn, 0.0, 0.0,
               -sn, cs, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]));
}


/*

  function hRotation(dx, dy, phi) {
    let cs = Math.cos(phi);
    let sn = Math.sin(phi);
  
    let rot = [
      cs, sn, 0.0, 0.0,
      -sn, cs, 0.0, 0.0,
       0.0, 0.0, 1.0, 0.0,
       0.0, 0.0, 0.0, 1.0];
  
    return  m4.multiply(hTranslation(-dx,-dy),m4.multiply(rot,hTranslation(dx,dy)));
  }
  */


  
// poincaré to hyperboloid 
function p2h(p) { 
    let t = 2.0/(1.0-(p[0]*p[0]+p[1]*p[1])); 
    return [t*p[0],t*p[1],t-1.0,1.0]; 
}
// hyperboloid to poincaré
function h2p(p) {
    let d = 1.0/(p[3] + p[2]);
    return [p[0]*d, p[1]*d];
}
// poincaré to klein
function p2k(p) {
    let s = 2.0/(1.0 + p[0]*p[0] + p[1]*p[1]);
    return [s*p[0], s*p[1]]
}
// klein to poincaré
function k2p(p) {
    let s = 1.0/(1.0 + Math.sqrt(1.0 - p[0]*p[0] - p[1]*p[1]));
    return [s*p[0], s*p[1]]
}

// poincaré => hyperboloid => transform => poincaré
function pTransform(mat, p) {
    let q = [0,0,0,1];
    twgl.m4.transformPoint(mat, p2h(p), q);
    return h2p(q);
}

// return a arc point generator f: f(0) == x1,y1, f(1) == x2,y2
// see: https://www.geeksforgeeks.org/equation-of-circle-when-three-points-on-the-circle-are-given/
function getCircleArc(p1, p2, p3)
{
    let [x1,y1] = p1;
    let [x2,y2] = p2;
    let [x3,y3] = p3;
    
    let x12 = x1 - x2;
    let x13 = x1 - x3;
 
    let y12 = y1 - y2;
    let y13 = y1 - y3;
 
    let y31 = y3 - y1;
    let y21 = y2 - y1;
 
    let x31 = x3 - x1;
    let x21 = x2 - x1;
 
    //x1^2 - x3^2
    let sx13 = Math.pow(x1, 2) - Math.pow(x3, 2);
 
    // y1^2 - y3^2
    let sy13 = Math.pow(y1, 2) - Math.pow(y3, 2);
 
    let sx21 = Math.pow(x2, 2) - Math.pow(x1, 2);
    let sy21 = Math.pow(y2, 2) - Math.pow(y1, 2);
 
    let fden = 2 * (y31 * x12 - y21 * x13);
    let gden = 2 * (x31 * y12 - x21 * y13);
    
    const eps = 1.0e-8;
    if(Math.abs(fden)<eps || Math.abs(gden) < eps)
    {
        // punti allineati
        return function(t) {
            return [(1-t)*x1+t*x2, (1-t)*y1+t*y2];
        }
    }
    
    let f = ( sx13 * x12
            + sy13 * x12
            + sx21 * x13
            + sy21 * x13)
            / fden;
    let g = ( sx13 * y12
            + sy13 * y12
            + sx21 * y13
            + sy21 * y13)
            / gden;
 
    let c = -(Math.pow(x1, 2)) - Math.pow(y1, 2) - 2 * g * x1 - 2 * f * y1;
 
    // eqn of circle be
    // x^2 + y^2 + 2*g*x + 2*f*y + c = 0
    // where centre is (h = -g, k = -f) and radius r
    // as r^2 = h^2 + k^2 - c
    let cx = -g;
    let cy = -f;
    // r is the radius
    let r = Math.sqrt(cx * cx + cy * cy - c);

    return function(t) {
        let x = (1-t)*x1 + t*x2;
        let y = (1-t)*y1 + t*y2;
        let dx = x - cx;
        let dy = y - cy;
        let d = Math.sqrt(dx*dx+dy*dy);
        let s = r/d;
        return [cx + dx*s, cy + dy*s];        
    }
}