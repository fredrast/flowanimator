export default function Timer(setAnimationTime, handleAnimationFinished) {
  const INTERVAL = 20;

  this.id = Math.round(Math.random() * 100);
  this.loadProgress = 0;
  this.intervalId = undefined;

  // BOOOKMARK
  // TODO make timer stop when end of (so far loaded) animation reached

  this.setLoadProgress = loadProgress => {
    this.loadProgress = loadProgress;
  };

  this.play = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      setAnimationTime(previousAnimationTime => {
        if (previousAnimationTime + INTERVAL >= this.loadProgress) {
          handleAnimationFinished();
        }
        return Math.min(previousAnimationTime + INTERVAL, this.loadProgress);
      });
    }, INTERVAL);
  };

  this.pause = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  };
}
