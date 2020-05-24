export default function Timer(setAnimationTime) {
  const INTERVAL = 20;
  var intervalId = undefined;
  console.log('Spawning new Timer');

  // BOOOKMARK
  // TODO make timer stop when end of (so far loaded) animation reached

  this.play = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
      setAnimationTime(previousAnimationTime => {
        return previousAnimationTime + INTERVAL;
      });
    }, INTERVAL);
  };

  this.pause = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}
