import path from "path";
import fs from "graceful-fs";
import chokidar, {FSWatcher} from "chokidar";
import {Promise as Bluebird} from "bluebird";
import clone from "lodash.clonedeep";

interface BaseResource {
  id: string;
}

export default class JsonResource<T extends BaseResource> {
  private readonly basePath: string;
  private readonly cache: { [k: string]: T } = {};
  private watcher: FSWatcher;
  private isCacheReady: boolean = false;

  constructor(basePath: string) {
    this.basePath = basePath;

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    this.watcher = chokidar.watch(path.resolve(this.basePath), {
      ignored: '.gitkeep',
      persistent: true,
      usePolling: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      },
    });
    this.watcher
      .on('all', async (event, filePath) => {
        if (path.extname(filePath) !== '.json') return;

        const id = path.basename(filePath, path.extname(filePath))

        if (event === 'add' || event === 'change') {
          this.cache[id] = null;
        }

        if (event === 'unlink' && id in this.cache) {
          delete this.cache[id];
        }
      })
      .once('ready', () => {
        this.isCacheReady = true;
        this.all().catch(console.error);
      });
  }

  getIds = async (): Promise<string[]> => {
    if (this.isCacheReady) {
      return Object.keys(this.cache);
    }

    const fileNames = await fs.promises.readdir(this.basePath);
    const ids = fileNames
      .filter(f => f.endsWith('.json'))
      .map(f => path.basename(f, '.json'));

    return ids;
  };

  all = async (): Promise<T[]> => {
    const ids = await this.getIds();
    const all = (await Bluebird.map(ids, async (id) => this.one(id), { concurrency: 1 })).filter(Boolean);
    this.isCacheReady = true;

    return all;
  };

  one = async (id: string): Promise<T | undefined> => {
    if(this.isCacheReady && this.cache[id]) {
      return clone(this.cache[id]);
    }

    const fileName = path.resolve(this.basePath, `./${id}.json`);

    if (!fs.existsSync(fileName)) {
      return undefined;
    }

    const content = await fs.promises.readFile(fileName, 'utf8');
    const data: T = JSON.parse(content);
    this.cache[id] = clone(data);

    return data;
  };

  remove = async (id: string): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./${id}.json`);

    if (!fs.existsSync(fileName)) return;

    await fs.promises.unlink(fileName);
    delete this.cache[id];
  };

  set = async (data: T): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./${data.id}.json`);
    const content = JSON.stringify(data, null, 2)
    await fs.promises.writeFile(fileName, content, 'utf8');
    this.cache[data.id] = clone(data);
  }
}