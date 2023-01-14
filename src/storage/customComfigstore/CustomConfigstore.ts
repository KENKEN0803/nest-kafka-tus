import type { Upload } from '@tus/server';
import { isEmpty } from 'lodash';

export class CustomConfigstore {
  constructor(initData?: Array<Upload>) {
    this.init(initData);
  }

  private async init(previousData?: Array<Upload>) {
    // DB connection
    if (isEmpty(previousData)) {
      this.data = new Map<string, Upload>();
    } else {
      this.data = new Map<string, Upload>(
        previousData.map((upload) => [upload.id, upload]),
      );
    }
  }

  private data: Map<string, Upload>;

  get(key: string): Upload | undefined {
    console.log('MemoryConfigstore.get key=', key);
    const res = this.data.get(key);
    console.log('MemoryConfigstore.get res=', res);
    return res;
  }

  set(key: string, value: Upload) {
    console.log('MemoryConfigstore.set', key, value);
    this.data.set(key, value);
  }

  delete(key: string) {
    console.log('MemoryConfigstore.delete', key);
    return this.data.delete(key);
  }

  get all(): Record<string, Upload> {
    const res = Object.fromEntries(this.data.entries());
    console.log('MemoryConfigstore.all', res);
    return res;
  }
}
