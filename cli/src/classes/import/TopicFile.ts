import { readFile } from 'fs/promises';
import * as path from 'path';

const EXPORT_PATH = path.resolve(__dirname, '../../..', 'export');
const TOPIC_FILE = 'topic.json';

export class TopicFile {
  private nodes!: [];

  getNodes() {
    return this.nodes;
  }

  async openFile() {
    const jsonFile = await readFile(`${EXPORT_PATH}/${TOPIC_FILE}`, 'utf8');
    this.nodes = JSON.parse(jsonFile);
  }
}
