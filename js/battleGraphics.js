"use strict";
/**
 * Takes the position of two units and draws an arc connecting the positions together
 */
function drawAttack(source, destination) {
    let color = source.getColor();
    if (source.x > destination.x) {
        let temp = source;
        source = destination;
        destination = temp;
    }
    let p1 = { x: xToPixel(source.x) + battleObjectSize * 0.707, y: yToPixel(source.y) - battleObjectSize * 1.707 };
    let p2 = { x: xToPixel(destination.x) - battleObjectSize * 0.707, y: yToPixel(destination.y) - battleObjectSize * 1.707 };
    let ctr = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 + 10 + Math.abs(p2.x - p1.x) / 2 };
    let diffX = p1.x - ctr.x;
    let diffY = p1.y - ctr.y;
    let radius = Math.abs(Math.sqrt(diffX * diffX + diffY * diffY));
    let startAngle = Math.atan2(diffY, diffX);
    let endAngle = Math.atan2(p2.y - ctr.y, p2.x - ctr.x);
    c.save();
    c.translate(ctr.x, ctr.y);
    c.scale(1, 1);
    c.lineWidth = 3;
    c.strokeStyle = color;
    c.beginPath();
    c.arc(0, 0, radius, startAngle, endAngle, false);
    c.stroke();
    c.closePath();
    c.restore();
}
function xToPixel(x) {
    return (x - 3) / 94 * canvas.width;
}
function yToPixel(y) {
    return (1 - y / 100) * canvas.height;
}
function clearCanvas() {
    c.clearRect(0, 0, canvas.width, canvas.height);
}
