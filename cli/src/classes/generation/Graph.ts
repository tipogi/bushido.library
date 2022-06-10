import { writeFile } from 'fs/promises';
import * as path from 'path';
import { IDomainCard, ITopicCard } from '../../interfaces';

const EXPORT_PATH = path.resolve(__dirname, '../../..', 'export');

/**
 * Before creation of JSON files, we will store all the files here
 */
export class Graph {
  private topics: ITopicCard[] = [];
  private domains: IDomainCard[] = [];

  public addTopic(topic: any) {
    this.topics.push(topic);
  }

  public addDomain(domain: any) {
    this.domains.push(domain);
  }

  public async createJSONFiles() {
    await writeFile(`${EXPORT_PATH}/topic.json`, JSON.stringify(this.topics));
    await writeFile(`${EXPORT_PATH}/domain.json`, JSON.stringify(this.domains));
  }
}
