export default function Timer(
  setAnimationTime,
  loadProgress,
  handleAnimationFinished
) {
  const INTERVAL = 20;
  var intervalId = undefined;
  this.loadProgress = loadProgress;
  // BOOOKMARK
  // TODO make timer stop when end of (so far loaded) animation reached

  this.play = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
      setAnimationTime(previousAnimationTime => {
        if (previousAnimationTime + INTERVAL >= loadProgress) {
          handleAnimationFinished();
        }
        return Math.min(previousAnimationTime + INTERVAL, loadProgress);
      });
    }, INTERVAL);
  };

  this.pause = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}
