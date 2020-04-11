/**
 * @file src/index.js
 * @description Main javascript file loaded by index.html. Creates a timeline,
 * ui and animation object and shares certain resources among these. The actual
 * application logic resides in the Ui and Animation modules and the submodules
 * imported by these.
 */

"use strict";
import { Ui } from "./ui.js";
import { Animation } from "./animation.js";
import { Timeline } from "./timeline.js";

const timeline = new Timeline();
const ui = new Ui(timeline);
const animation = new Animation(ui, timeline);
// Set the function that should be called in ui.js when the user has selected
// a new file to be read
ui.setReadProjectDataFromFile(animation.readProjectDataFromFile);
// Set the function that should be called in ui.js when the user has selected
// a board to be read from Jira
ui.setReadProjectDataFromJira(animation.readProjectDataFromJira);

// window.addEventListener('mousemove', e => {
//   /* console.log(e); */
// });
