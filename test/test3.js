const MyConstructor = function(maxValue) {
  this.attribute = 'foo';
  this.maxValue = maxValue;
  this[Symbol.iterator] = function() {
    var value = 0;

    return {
      next: function() {
        return value <= 10
          ? { value: value++, done: false }
          : { value: value, done: true };
      },
    };
  };
};

const myObject = new MyConstructor(10);
console.log('Starting first iteration...');
for (var iteratedValue of myObject) {
  console.log(iteratedValue);
}
console.log('First iteration done!');

console.log();
console.log('Starting second iteration...');
for (var iteratedValue of myObject) {
  console.log(iteratedValue);
}
console.log('Second teration done!');

function MyGeneratorWrapper() {
  this.data = [1, 2, 3, 4];
  this.getIterator = function*() {
    for (var item of this.data) {
      yield item;
    }
  };
}

const myGeneratorWrapper = new MyGeneratorWrapper();

console.log();
console.log('Starting third iteration...');
for (var iteratedValue of myGeneratorWrapper.getIterator()) {
  console.log(iteratedValue);
}
console.log('Third iteration done!');

console.log();
console.log('Starting fourth iteration...');
for (var iteratedValue of myGeneratorWrapper.getIterator()) {
  console.log(iteratedValue);
}
console.log('Fourth iteration done!');

// function MyArrayObject() {
//   this.data = [1, 2, 3, 4];
//   this[Symbol.iterator] = () => {
//     return {
//       next: () => {
//         return this.data.next;
//       },
//     };
//   };
// }

// const data = [1, 2, 3, 4];
// console.log(data.next);
//
// const myArrayObject = new MyArrayObject();
// console.log();
// console.log('Starting fifth iteration...');
// for (var myArrayValue of myArrayObject) {
//   console.log(myArrayValue);
// }
// console.log('Fifth iteration done!');
