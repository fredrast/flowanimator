import { BUTTON_WIDTH, Button } from './button.js';

const startWidth = 100;
const startHeight = 100;
const minWidth = 500;
const minHeight = 250;
const maxWidth = 1000;
const maxHeight = 500;
var viewPortDeltaX = 0;
var viewPortDeltaY = 0;
const rightEnd = 400;
const bottomEnd = 200;

var x1 = (-1 * window.innerWidth) / 2;
var x2 = window.innerWidth / 2;
var y1 = (-1 * window.innerHeight) / 2;
var y2 = window.innerHeight / 2;

const canvas = SVG('svg');
canvas.size(window.innerWidth, window.innerHeight);
const canvasWidth = canvas.width();
const canvasHeight = canvas.height();
// canvas.viewbox(x1, y1, x2, y2);
// canvas.viewbox({
//   x: rightEnd - window.innerWidth,
//   y: bottomEnd - window.innerHeight,
//   width: window.innerWidth,
//   height: window.innerHeight,
// });
console.log(window.innerWidth + 'x' + window.innerHeight);
console.log(canvasWidth + 'x' + canvasHeight);
console.log(canvas.size());
console.log(canvas.viewbox());
console.log();

const background = canvas.rect('100%', '100%').fill('#97F9F9');

const button1 = new Button('', canvas, 20, 150, () => {
  var newWidth = canvas.viewbox().width * 1.25;
  var newHeight = canvas.viewbox().height * 1.25;
  var newX = canvas.viewbox().x - (newWidth - canvas.viewbox().width);
  var newY = canvas.viewbox().y - (newHeight - canvas.viewbox().height);
  canvas.viewbox({ x: newX, y: newY, width: newWidth, height: newHeight });
});
const button2 = new Button('', canvas, 80, 150, () => {
  var newWidth = canvas.viewbox().width * 0.8;
  var newHeight = canvas.viewbox().height * 0.8;
  var newX = canvas.viewbox().x - (newWidth - canvas.viewbox().width);
  var newY = canvas.viewbox().y - (newHeight - canvas.viewbox().height);
  canvas.viewbox({ x: newX, y: newY, width: newWidth, height: newHeight });
});

// window.resizeTo(startWidth, startHeight);

// const borderBox = canvas
//   .polyline([[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]])
//   .fill('none')
//   .stroke({ width: 5, color: 'black' });

canvas.line(-1000, 0, 1000, 0).stroke({ width: 3, color: 'black' });
canvas.line(0, -1000, 0, 1000).stroke({ width: 3, color: 'black' });

for (var i = -1000; i <= 1000; i = i + 10) {
  canvas.line(i, -5, i, 5).stroke({ width: 1, color: 'black' });
  canvas.line(-5, i, 5, i).stroke({ width: 1, color: 'black' });
}

const coordsText = canvas.text('');
coordsText.move(10, 10);
coordsText.font({
  family: 'Helvetica',
  size: 10,
});

canvas.on('mousemove', e => {
  coordsText.clear();
  coordsText.text(
    // 'screenX: ' +
    //   e.screenX +
    //   '\n' +
    //   'screenY: ' +
    //   e.screenY +'\n' +
    'clientX: ' + e.clientX + '\n' + 'clientY: ' + e.clientY
  );
});

const circle1 = canvas
  .circle(5)
  .fill({ color: 'red' })
  .center(0, 0);

window.addEventListener('resize', windowResize);

function windowResize() {
  const deltaX = window.innerWidth - canvas.viewbox().width;
  const deltaY = window.innerHeight - canvas.viewbox().height;
  canvas.size(window.innerWidth, window.innerHeight);
  canvas.viewbox({
    x: rightEnd - window.innerWidth,
    y: bottomEnd - window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
  });
  console.log(window.innerWidth + 'x' + window.innerHeight);
  console.log(canvas.viewbox());
  console.log();
}
