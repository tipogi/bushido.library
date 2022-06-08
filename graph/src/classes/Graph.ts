/**
 * Before creation of JSON files, we will store all the files here
 */
export class Graph {
  private topics: any[] = [];
  private domains = [];

  constructor () {}

  public addTopic(topic: any) {
    this.topics.push(topic)
  }

  public getTopic() {
    console.log(this.topics);
  }

  public addDomain(domain: any) {
    this.domains.push()
  }

  public createJSONFiles() {
    //await writeFile('../export/topic.json', JSON.stringify(graphTopics))
  }
}