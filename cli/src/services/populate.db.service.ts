import { Injectable } from '@nestjs/common';
import { red, green } from 'colors';
import { File } from 'src/classes/import';
import { NodeType } from 'src/enumerators';
import { createDomainCypherQuery, createTopicCypherQuery } from 'src/helpers/query.generator';
import { IDomainCard, ITopicCard } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';

@Injectable()
export class PopulateDBService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async withTopics() {
    const topicFile = new File(NodeType.TOPIC);
    await topicFile.openFile();
    let node: ITopicCard;
    // Loop with that for. It has the behaivour to stop the loop until
    // the asynchronous task is finished
    for (node of topicFile.getNodes()) {
      const { query, data } = createTopicCypherQuery(node);
      try {
        await this.neo4jService.write(query, data);
        console.log('\t', green(node.name), 'topic added in the graph');
      } catch (e) {
        throwNeo4JError(e, node.name);
        console.log({ ...data });
        break;
      }
    }
  }

  async withDomains() {
    const topicFile = new File(NodeType.DOMAIN);
    await topicFile.openFile();
    let node: IDomainCard;
    // Loop with that for. It has the behaivour to stop the loop until
    // the asynchronous task is finished
    for (node of topicFile.getNodes()) {
      const { query, data } = createDomainCypherQuery(node);
      try {
        await this.neo4jService.write(query, data);
        console.log('\t', green(node.name), 'doamin added in the graph');
      } catch (e) {
        throwNeo4JError(e, node.name);
        console.log({ ...data });
        break;
      }
    }
  }
}

const throwNeo4JError = (e, name) => {
  if (e.code) {
    console.log(red(`ERROR while we try to merge ${name} node: ${e.code}`));
  } else {
    console.log(red(e));
  }
};
