import { workerManager } from '../workerManager';

export default function someComputation(callback: (num: number) => void) {
  return workerManager.queueJob(() => {

    // some heavy computation that posts progress on intervals
    const n = 1000000000;
    for (let i = 0; i < n; i++) {
      if (i%1000 === 0) postMessage(i / n);
    }
    // setInterval(() => {
    //   postMessage(Math.random());
    // }, 1000);

  }, (err, data) => {
    if (err) throw err;
    if (data) callback(data);
  });
}
