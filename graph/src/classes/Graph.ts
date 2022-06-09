import { writeFile } from "fs/promises";
import { IDomainCard, ITopicCard } from "../interfaces";

/**
 * Before creation of JSON files, we will store all the files here
 */
export class Graph {
  private topics: ITopicCard[] = [];
  private domains: IDomainCard[] = [];

  constructor () {}

  public addTopic(topic: any) {
    this.topics.push(topic)
  }

  public addDomain(domain: any) {
    this.domains.push(domain)
  }

  public async createJSONFiles() {
    await writeFile('../export/topic.json', JSON.stringify(this.topics))
    await writeFile('../export/domain.json', JSON.stringify(this.domains))
  }
}