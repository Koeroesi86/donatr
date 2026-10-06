import {EventEmitter} from 'node:events';

// Replaces the ESM-only chokidar in tests: no real file watching, events are emitted by the tests.
export class FakeWatcher extends EventEmitter {
  readonly target: string;

  constructor(target: string) {
    super();
    this.target = target;
  }

  close = () => Promise.resolve();
}

export const watchers: FakeWatcher[] = [];

const chokidar = {
  watch: (target: string) => {
    const watcher = new FakeWatcher(target);
    watchers.push(watcher);
    return watcher;
  },
};

export default chokidar;
