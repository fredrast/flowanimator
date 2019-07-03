const BUTTON_FILL_DEFAULT = '#FFFFFF';
const BUTTON_FILL_HOVER = '#E8E7ED';
const BUTTON_FILL_PRESSED = '#BEBEC2';
const BUTTON_ICON_DEFAULT = '#000000';
const BUTTON_ICON_DISABLED = '#999999';

export const BUTTON_WIDTH = 40;

export function Button(type, canvas, x, y, clickHandler) {
  this.elements = canvas.group();
  this.elements.circleElement = this.elements.circle(BUTTON_WIDTH);
  this.elements.circleElement.fill(BUTTON_FILL_DEFAULT);
  this.width = BUTTON_WIDTH;
  switch (type) {
    case 'open':
      this.elements.icon = this.elements.group();
      this.elements.icon.polygon([0, 10, 20, 10, 10, 0]);
      this.elements.icon
        .line([0, 15, 20, 15])
        .stroke({ width: 3, color: 'black' });
      this.elements.icon.center(20, 18);
      break;

    case 'play':
      this.elements.icon = this.elements.group();
      this.elements.icon.polygon([0, 0, 0, 20, 10, 10]);
      this.elements.icon
        .line([15, 0, 15, 20])
        .stroke({ width: 3, color: 'black' });
      this.elements.icon
        .line([20, 0, 20, 20])
        .stroke({ width: 3, color: 'black' });
      this.elements.icon.center(20, 20);
      break;

    case 'stop':
      this.elements.icon = this.elements.rect(20, 20).center(20, 20);
      break;

    default:
      this.elements.icon = {};
  }

  this.elements.translate(x, y);

  this.elements.on('click', () => {
    clickHandler();
  });

  this.elements.on('mouseover', function() {
    this.circleElement.fill({ color: BUTTON_FILL_HOVER });
  });

  this.elements.on('mousedown', function() {
    this.circleElement.fill({ color: BUTTON_FILL_PRESSED });
  });

  this.elements.on('mouseup', function() {
    this.circleElement.fill({ color: BUTTON_FILL_HOVER });
  });

  this.elements.on('mouseout', function() {
    this.circleElement.fill({ color: BUTTON_FILL_DEFAULT });
  });
  return this;
}
