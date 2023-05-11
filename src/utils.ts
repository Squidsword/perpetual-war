function drawNormal() {
    let u1 = Math.random();
    let u2 = Math.random();
  
    let z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
    return z1;
  }