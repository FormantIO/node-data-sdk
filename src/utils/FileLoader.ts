import * as fs from 'fs/promises';

export class FileLoader {
  static async readFile(relPath: string): Promise<string> {
    return fs.readFile(relPath, 'utf8');
  }
}
