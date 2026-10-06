import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'donatr-test-'));

export const removeDir = (dir: string) => fs.rmSync(dir, { recursive: true, force: true });
