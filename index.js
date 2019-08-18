// import * as SVG from './node_modules/svg.js/dist/svg.js';
'use strict';
import { Ui } from './ui.js';
import { Animation } from './animation.js';
import { FlowAnimatorTimeline } from './timeline.js';

const timeline = new FlowAnimatorTimeline();

const ui = new Ui(timeline);
const animation = new Animation(ui, timeline);
ui.setFunctionToProcessFile(animation.readStoriesAndTransitionsFromFile);

/* console.log(
  'lorem' +
    '\n' +
    'ipsum' +
    '\n' +
    'solor' +
    '\n' +
    'dit' +
    ui.setFunctionToProcessFile +
    ui.setFunctionToProcessFile
); */

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                                                            //
//                           TRIAL & DEBUG CODE                               //
//                                                                            //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// const coordsText = canvas.text('');
// coordsText.move(canvas.viewbox().x + 10, canvas.viewbox().y + 10);
// coordsText.font({
//   family: 'Helvetica',
//   size: 10,
//   anchor: 'right',
//   leading: '1.5em',
// });
//
// canvas.on('mousemove', e => {
//   coordsText.clear();
//   coordsText.text(
//     'client x: ' +
//       e.clientX +
//       '\n' +
//       'client y: ' +
//       e.clientY +
//       '\n' +
//       'viewbox x: ' +
//       (e.clientX + canvas.viewbox().x) +
//       '\n' +
//       'viewbox y: ' +
//       (e.clientY + canvas.viewbox().y)
//   );
//   //
// });
