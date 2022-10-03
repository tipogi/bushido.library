import { Injectable } from '@nestjs/common';
import { red } from 'colors';
import { isEmpty } from 'lodash';
import { Neo4jError } from 'neo4j-driver';
import { TopicFile, DomainFile } from 'src/classes/import';
import { NEO4J_ACTIONS } from 'src/enumerators';
import { createDomainCypherQuery, createTopicCypherQuery, DELETE_DOMAIN_BY_HASH } from 'src/helpers/query.generator';
import { IDomainExt, ITopicCard } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';
import { ExtractDBService } from './extract.db.service';
import { LogService } from './log.service';

@Injectable()
export class PopulateDBService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly extractService: ExtractDBService,
    private readonly logService: LogService,
  ) {}

  async withTopics() {
    const topicFile = new TopicFile();
    await topicFile.openFile();
    let node: ITopicCard;
    // Loop with that for. It has the behaivour to stop the loop until
    // the asynchronous task is finished
    for (node of topicFile.getNodes()) {
      const { query, data } = createTopicCypherQuery(node);
      try {
        await this.neo4jService.write(query, data);
        this.logService.topicAdded(node.name);
      } catch (e) {
        throwNeo4JError(e, node.name, NEO4J_ACTIONS.MERGE);
        console.log({ ...data });
      }
    }
  }

  async withDomains() {
    const domainNodesToImport = new DomainFile();
    const [domainsByHash, domainsByUrl] = await Promise.all([
      this.extractService.getDomainNodes(),
      domainNodesToImport.createNodeObjects(),
    ]);
    for (const { hash, url, name } of domainsByHash) {
      // The node has the same name and path
      if (domainNodesToImport.containsHash(hash)) {
        const domainNode = domainNodesToImport.getNode(hash);
        await this.updateNode(domainNode);
        domainNodesToImport.popDomain(hash);
      }
      // Domain URL exist but the hash is not the same
      else if (domainsByUrl.hasOwnProperty(url)) {
        const domainNode = domainNodesToImport.getNode(domainsByUrl[url]);
        // It means that it has different path, if not the hash would be the same
        if (name === domainNode.name) {
          // Maybe WHERE node.name = name and node.url = url
          await this.deleteNode(hash);
          this.logService.deletedNode(name);
        } else {
          const samePath = await this.extractService.hasSamePath(domainNode.path, url);
          if (samePath) {
            await this.updateNode(domainNode);
            domainNodesToImport.popDomain(hash);
            this.logService.updatedTheNameSamePath(name, domainNode.name);
          } else {
            await this.deleteNode(hash);
            this.logService.deletedNode(name);
          }
        }
      }
      // The node was deleted because the hash and url does not exist anymore
      else {
        await this.deleteNode(hash);
        this.logService.definitiveDeleteNode(name, hash);
      }
    }
    if (!isEmpty(domainNodesToImport.getNodes())) {
      await this.createTheMissingNodes(domainNodesToImport);
    }
  }

  async createTheMissingNodes(domainNodesToImport: DomainFile) {
    const domainArray: IDomainExt[] = Object.values(domainNodesToImport.getNodes());
    let newDomain: IDomainExt;
    for (newDomain of domainArray) {
      await this.updateNode(newDomain, false);
      this.logService.domainAdded(newDomain.name);
    }
  }

  async updateNode(node: IDomainExt, updated = true) {
    try {
      const { query, data } = createDomainCypherQuery(node);
      await this.neo4jService.write(query, data);
      updated && this.logService.updatedNode(node.name);
    } catch (e) {
      throwNeo4JError(e, node.name, NEO4J_ACTIONS.MERGE);
    }
  }

  async deleteNode(hash: string) {
    try {
      await this.neo4jService.write(DELETE_DOMAIN_BY_HASH, { hash });
    } catch (e) {
      throwNeo4JError(e, hash, NEO4J_ACTIONS.DELETE);
    }
  }
}

const throwNeo4JError = (e: Neo4jError, name: string, action: NEO4J_ACTIONS) => {
  if (e.code) {
    console.log(red(`ERROR while we try to ${action} ${name} node: ${e.code}`));
  } else {
    console.log(e);
  }
};
