import { readFile } from 'fs/promises';
import * as path from 'path';
import { NodeType } from 'src/enumerators';

const EXPORT_PATH = path.resolve(__dirname, '../../..', 'export');
const TOPIC_FILE = 'topic.json';
const DOMAIN_FILE = 'domain.json';

export class File {
  private nodes!: [];
  constructor(private type: NodeType) {}

  getNodes() {
    return this.nodes;
  }

  async openFile() {
    const file = this.type === NodeType.TOPIC ? TOPIC_FILE : DOMAIN_FILE;
    const jsonFile = await readFile(`${EXPORT_PATH}/${file}`, 'utf8');
    this.nodes = JSON.parse(jsonFile);
  }
}
