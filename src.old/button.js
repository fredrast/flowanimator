/**
 * @file src/button.js
 * @description Defines the {@link Button} class, which generates buttons on the SVG
 * canvas, draws their icons and defines their hover and click behavior.
 * Idea and code example from <https://codepen.io/fuzzyma/pen/wQbVed>
 * Could be better to create HTML buttons instead, that would enable the
 * buttons to receive focus when pressing the tab key, and that would also
 * make it easier to create a fully responsive layout.
 */

const BUTTON_STROKE = '#FFFFFF';
const BUTTON_FILL_DEFAULT = '#EFEFEF';
const BUTTON_FILL_HOVER = '#FFFFFF';
const BUTTON_FILL_PRESSED = '#BEBEC2';
const BUTTON_FILL_DISABLED = '#DDDDDD';
const BUTTON_ICON_DEFAULT = '#000000';
const BUTTON_ICON_DISABLED = '#999999';

/**
 * @constructor Button
 * @description Generates buttons on the SVG canvas, draws their icons and
 * defines their hover and click behavior. Idea and code example
 * from <https://codepen.io/fuzzyma/pen/wQbVed>
 * Could be better to create HTML buttons instead, that would enable the
 * buttons to receive focus when pressing the tab key, and that would also
 * make it easier to create a fully responsive layout.
 * @param type Defines the type of button to be created, or more precisely,
 * the type of icon to be drawn on the button. Following types supported:
 * open, play, stop, slower and faster.
 * @param canvas A reference to the SVG canvas on which the button should be
 * drawn.
 * @param x  x coordinate of the button on the canvas
 * @param y y coordinate of the button on the canvas
 * @param radius The radius of the button
 * @param clickHandler Click handling function to be set on the button
 */
export function Button(type, canvas, x, y, radius, clickHandler) {
  this.elements = canvas.group();
  this.elements.circleElement = this.elements.circle(radius);
  this.elements.circleElement.fill(BUTTON_FILL_DEFAULT);
  switch (type) {
    case 'open':
      this.elements.icon = this.elements.group();
      this.elements.icon
        .polygon([0, 10, 20, 10, 10, 0])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linejoin: 'round' })
        .fill({ color: BUTTON_ICON_DEFAULT });
      this.elements.icon
        .line([0, 15, 20, 15])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linecap: 'round' });
      this.elements.icon.center(20, 18);
      break;

    case 'play':
      this.elements.icon = this.elements.group();
      this.elements.icon
        .polygon([0, 0, 0, 20, 10, 10])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linejoin: 'round' })
        .fill({ color: BUTTON_ICON_DEFAULT });
      this.elements.icon
        .line([15, 0, 15, 20])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linecap: 'round' });
      this.elements.icon
        .line([20, 0, 20, 20])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linecap: 'round' });
      this.elements.icon.center(20, 20);
      break;

    case 'stop':
      this.elements.icon = this.elements.group();
      this.elements.icon
        .rect(17, 17)
        .center(20, 20)
        .stroke({ width: 2, color: BUTTON_ICON_DEFAULT, linejoin: 'round' })
        .fill({ color: BUTTON_ICON_DEFAULT });
      break;

    case 'slower':
      this.elements.icon = this.elements.group();
      this.elements.icon
        .polygon([0, 10, 10, 0, 10, 20])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linejoin: 'round' })
        .fill({ color: BUTTON_ICON_DEFAULT });
      this.elements.icon
        .polygon([10, 10, 20, 0, 20, 20])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linejoin: 'round' })
        .fill({ color: BUTTON_ICON_DEFAULT });
      this.elements.icon.center(17, 20);
      break;

    case 'faster':
      this.elements.icon = this.elements.group();
      this.elements.icon
        .polygon([0, 0, 0, 20, 10, 10])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linejoin: 'round' })
        .fill({ color: BUTTON_ICON_DEFAULT });
      this.elements.icon
        .polygon([10, 0, 10, 20, 20, 10])
        .stroke({ width: 3, color: BUTTON_ICON_DEFAULT, linejoin: 'round' })
        .fill({ color: BUTTON_ICON_DEFAULT });
      this.elements.icon.center(23, 20);
      break;

    default:
      this.elements.icon = this.elements.group();
  }

  this.elements.translate(x, y);

  this.clickHandler = clickHandler;

  this.activate = () => {
    this.elements.off();
    this.elements.on('click', this.clickHandler);

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

    this.elements.icon.node.childNodes.forEach(node => {
      // /* console.log(node); */
      if (node.hasAttribute('stroke')) {
        node.attributes.stroke.value = BUTTON_ICON_DEFAULT;
      }
      if (node.hasAttribute('fill')) {
        node.attributes.fill.value = BUTTON_ICON_DEFAULT;
      }
    });
    this.elements.circleElement.fill({ color: BUTTON_FILL_DEFAULT });
  };

  this.passivate = () => {
    // unbind all event handlers
    this.elements.off();

    this.elements.icon.node.childNodes.forEach(node => {
      if (node.hasAttribute('stroke')) {
        node.attributes.stroke.value = BUTTON_ICON_DISABLED;
      }
      if (node.hasAttribute('fill')) {
        node.attributes.fill.value = BUTTON_ICON_DISABLED;
      }
    });

    this.elements.circleElement.fill({ color: BUTTON_FILL_DISABLED });
  };

  this.passivate();

  return this;
}
