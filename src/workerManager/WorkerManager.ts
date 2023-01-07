import Queue from '../common/Queue';

type WorkerFunction = () => void;
type JobCallback = (err: any, data: any) => void;
type Job = {
  jobId: string,
  workerFn: WorkerFunction,
  callback: JobCallback,
}

export default class WorkerManager {
  private jobQueue: Queue<Job>;
  private workersPool: { [workerId: string]: {
    worker: Worker,
    job: Job,
  }};
  private MAX_WORKERS = 5;

  constructor() {
    this.jobQueue = new Queue();
    this.workersPool = {};
  }

  queueJob(workerFn: WorkerFunction, callback: JobCallback) {
    const jobId = crypto.randomUUID();
    this.jobQueue.queue({ jobId, workerFn, callback });

    this.tryCreateWorkerFromQueue();
    return jobId;
  }

  /**
   * Creates a new worker if numWorkers < MAX_WORKERS and jobs are available
   * @returns workerId if worker was created, or undefined
   */
  private tryCreateWorkerFromQueue(): string | undefined {
    if (this.getNumActiveWorkers() >= this.MAX_WORKERS) return;

    const job = this.jobQueue.dequeue();
    if (!job) return;

    const workerId = crypto.randomUUID();

    const url = this.fn2workerURL(job.workerFn);
    const worker = new Worker(url);

    worker.addEventListener('message', (ev) => {
      if (ev.data === 'finished') {
        // worker is finished execution
        delete this.workersPool[workerId];
        this.tryCreateWorkerFromQueue();
      } else {
        // message from worker for caller
        job.callback(null, ev.data);
      }
    });

    worker.addEventListener('error', (ev) => {
      const error = new Error(`${ev.message} in ${ev.filename}:${ev.lineno}`);
      job.callback(error, null);
    });

    this.workersPool[workerId] = { worker, job };

    return workerId;
  }

  terminateJob(jobId: string) {
    const nRemoved = this.jobQueue.remove((job) => job.jobId === jobId);
    if (nRemoved > 0) return;
    
    // job was not in queue, it is being processed by a worker, terminate worker
    
    const workEntry = Object.entries(this.workersPool).find(([workerId, { job }]) => job.jobId === jobId);
    if (!workEntry) return; // No worker found either
    workEntry[1].worker.terminate();
    delete this.workersPool[workEntry[0]];
  }

  getNumActiveWorkers() {
    return Object.keys(this.workersPool).length;
  }

  private fn2workerURL(fn: Function) {
    const blob = new Blob([`(${fn.toString()})(); postMessage('finished');`], {
      type: 'text/javascript',
    });
    return URL.createObjectURL(blob);
  }
}

