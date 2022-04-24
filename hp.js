
function hTranslation1(dx, dy) {
    let d = Math.sqrt(dx*dx+dy*dy);
    let phi = -Math.atan2(dy,dx);
    let cs = Math.cos(phi);
    let sn = Math.sin(phi);
    let h = 2 * Math.atanh(d);
    let csh = Math.cosh(h);
    let snh = Math.sinh(h);
    return m4.multiply(
        [
            cs,-sn, 0.0, 0.0,
            sn, cs, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ],
        m4.multiply(
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
    m4.transformPoint(mat, p2h(p), q);
    return h2p(q);
}