import path from "path";
import fs from "graceful-fs";
import chokidar, {FSWatcher} from "chokidar";

interface BaseResource {
  id: string;
}

export default class JsonResource<T extends BaseResource> {
  private readonly basePath: string;
  private readonly cache: { [k: string]: string } = {};
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
          await this.one(id);

          if (!this.isCacheReady && Object.keys(this.cache).length === (await this.getResourceIds()).length) {
            this.isCacheReady = true;
          }
        }

        if (event === 'unlink') {
          delete this.cache[id];
        }
      });
  }

  private getResourceIds = async (): Promise<string[]> => {
    if (!fs.existsSync(this.basePath)) {
      return [];
    }

    const fileNames = await fs.promises.readdir(this.basePath);
    const ids = fileNames
      .filter(f => f.endsWith('.json'))
      .map(f => path.basename(f, '.json'));

    return ids;
  };

  all = async (): Promise<T[]> => {
    const ids = this.isCacheReady ? Object.keys(this.cache) : await this.getResourceIds();
    const all = await Promise.all(ids.map(async (id) => this.one(id)));
    this.isCacheReady = true;

    return all.filter(Boolean);
  };

  one = async (id: string): Promise<T | undefined> => {
    if(this.isCacheReady && this.cache[id]) {
      return JSON.parse(this.cache[id]) as T;
    }

    const fileName = path.resolve(this.basePath, `./${id}.json`);

    if (!fs.existsSync(fileName)) return undefined;

    const content = await fs.promises.readFile(fileName, 'utf8');
    const data: T = JSON.parse(content);
    this.cache[id] = content;

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
    this.cache[data.id] = content;
  }
}