// Constructor for objects to represent the stories in the current project
// Read in a line from the input file and create the story and the story's
// transitions found on the line
export function Story(storyFields, initialStatus, initialSlot, ui) {
  if (storyFields.length == 0) {
    // TODO: raise som error here
  }

  // Initiate the properties of the story
  this.id = storyFields[0];
  this.link = storyFields[1];
  this.name = storyFields[2];

  this.initialStatus = initialStatus;
  this.status = initialStatus;
  this.status.storiesInStatus.push(this);
  this.verticalSlot = initialSlot;

  this.token = ui.getToken(this);

  this.previousTransitionAnimationFinish = 0; // Used during animation build, holding the timestamp when the prior transitionanimation was finished to avoid that next transition or drop animation starts before previous is finished
  this.previousDropAnimationFinish = 0; // As above, for previous drop animation

  this.clear = () => {
    console.log('Removing token');
    console.log(this);
    console.log(this.token);
    this.token.clear();
    this.token = null;
  };
}
