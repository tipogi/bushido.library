import { readFile } from 'fs/promises';
import * as path from 'path';
import { IDomainExt, IDomainNodeList } from 'src/interfaces';
import { forEach } from 'lodash';

const EXPORT_PATH = path.resolve(__dirname, '../../..', 'export');
const DOMAIN_FILE = 'domain.json';

export class DomainFile {
  private nodes!: IDomainNodeList;

  getNodes() {
    return this.nodes;
  }

  async openFile() {
    const jsonFile = await readFile(`${EXPORT_PATH}/${DOMAIN_FILE}`, 'utf8');
    const nodes: IDomainExt[] = JSON.parse(jsonFile);
    // Create object with keys
    const domainsToPush = {};
    forEach(nodes, (domain) => {
      domainsToPush[domain.hash] = domain;
    });
    this.nodes = domainsToPush;
  }
}
