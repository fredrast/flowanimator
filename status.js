// Constructor for objects to represent the statuses in the current project
export function Status(number, name) {
  this.number = number;
  this.name = name;
  this.storiesInStatus = [];
  this.text = {};
  this.center = 0;

  this.clear = function() {
    if (this.text.remove) this.text.remove();
  };
}
