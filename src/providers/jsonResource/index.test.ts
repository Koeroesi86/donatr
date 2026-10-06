/**
 * @jest-environment node
 */
import fs from "node:fs";
import path from "node:path";
import JsonResource from "./index";
import {watchers} from "../../test/mocks/chokidar";
import {createTempDir, removeDir} from "../../test/createTempDir";

interface Item {
  id: string;
  name: string;
}

describe('JsonResource', () => {
  let dir: string;
  let resource: JsonResource<Item>;
  const file = (id: string) => path.join(dir, `${id}.json`);

  beforeEach(() => {
    watchers.length = 0;
    dir = createTempDir();
    resource = new JsonResource<Item>(dir);
  });

  afterEach(() => removeDir(dir));

  it('creates a missing base directory', () => {
    const nested = path.join(dir, 'nested', 'deeper');
    new JsonResource<Item>(nested);

    expect(fs.existsSync(nested)).toBe(true);
  });

  it('persists items as json files and reads them back', async () => {
    await resource.set({ id: 'a', name: 'Alpha' });

    expect(JSON.parse(fs.readFileSync(file('a'), 'utf8'))).toEqual({ id: 'a', name: 'Alpha' });
    expect((await resource.one('a')).data).toEqual({ id: 'a', name: 'Alpha' });
  });

  it('reads items that already exist on disk', async () => {
    fs.writeFileSync(file('b'), JSON.stringify({ id: 'b', name: 'Beta' }));

    const { data, modified } = await resource.one('b');

    expect(data).toEqual({ id: 'b', name: 'Beta' });
    expect(modified).toBeGreaterThan(0);
  });

  it('returns no data for an unknown id', async () => {
    expect((await resource.one('missing')).data).toBeUndefined();
  });

  it('lists all json items and ignores other files', async () => {
    fs.writeFileSync(file('a'), JSON.stringify({ id: 'a', name: 'Alpha' }));
    fs.writeFileSync(file('b'), JSON.stringify({ id: 'b', name: 'Beta' }));
    fs.writeFileSync(path.join(dir, '.gitkeep'), '');
    fs.writeFileSync(path.join(dir, 'notes.txt'), 'not json');

    const { data } = await resource.all();

    expect(data.map((item) => item.id).sort()).toEqual(['a', 'b']);
  });

  it('reports the latest modification time of all items', async () => {
    fs.writeFileSync(file('old'), JSON.stringify({ id: 'old', name: 'Old' }));
    fs.utimesSync(file('old'), new Date(1_000_000), new Date(1_000_000));
    fs.writeFileSync(file('new'), JSON.stringify({ id: 'new', name: 'New' }));
    fs.utimesSync(file('new'), new Date(2_000_000), new Date(2_000_000));

    expect((await resource.all()).modified).toBe(2_000_000);
  });

  it('removes items from disk and from the listing', async () => {
    await resource.set({ id: 'a', name: 'Alpha' });
    await resource.all();
    await resource.remove('a');

    expect(fs.existsSync(file('a'))).toBe(false);
    expect((await resource.one('a')).data).toBeUndefined();
    expect((await resource.all()).data).toEqual([]);
  });

  it('ignores removing an unknown item', async () => {
    await expect(resource.remove('missing')).resolves.toBeUndefined();
  });

  describe('cache', () => {
    it('serves items from the cache until the file watcher reports a change', async () => {
      await resource.set({ id: 'a', name: 'Alpha' });
      fs.writeFileSync(file('a'), JSON.stringify({ id: 'a', name: 'Changed on disk' }));

      expect((await resource.one('a')).data?.name).toBe('Alpha');

      watchers[0].emit('all', 'change', file('a'));

      expect((await resource.one('a')).data?.name).toBe('Changed on disk');
    });

    it('picks up files added while the cache is warm', async () => {
      await resource.all();
      fs.writeFileSync(file('late'), JSON.stringify({ id: 'late', name: 'Late' }));
      watchers[0].emit('all', 'add', file('late'));

      expect((await resource.all()).data.map((item) => item.id)).toEqual(['late']);
    });

    it('forgets files that were deleted while the cache is warm', async () => {
      await resource.set({ id: 'a', name: 'Alpha' });
      await resource.all();
      fs.unlinkSync(file('a'));
      watchers[0].emit('all', 'unlink', file('a'));

      expect((await resource.all()).data).toEqual([]);
    });

    it('ignores watcher events for non-json files', async () => {
      await resource.set({ id: 'a', name: 'Alpha' });
      fs.writeFileSync(file('a'), JSON.stringify({ id: 'a', name: 'Changed on disk' }));
      watchers[0].emit('all', 'change', path.join(dir, 'a.txt'));

      expect((await resource.one('a')).data?.name).toBe('Alpha');
    });

    it('warms the cache when the watcher is ready', () => {
      const all = jest.spyOn(resource, 'all').mockResolvedValue({ data: [], modified: 0 });
      watchers[0].emit('ready');

      expect(all).toHaveBeenCalledTimes(1);
    });
  });
});
