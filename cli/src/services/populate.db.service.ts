import { Injectable } from '@nestjs/common';
import { red } from 'colors';
import { isEmpty } from 'lodash';
import { Neo4jError } from 'neo4j-driver';
import { TopicFile, DomainFile } from 'src/classes/import';
import { NEO4J_ACTIONS } from 'src/constants/enumerators';
import {
  createNewBrandDomainCypherQuery,
  createTopicCypherQuery,
  DELETE_DOMAIN_BY_HASH,
  updateByNameCypherQuery,
  updateByUrlCypherQuery,
} from 'src/helpers/query.generator';
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
    // domainNodesToImport: The NEW list of domains. We will use to update the previous domains,
    // if there is some change in that list
    const domainNodesToImport = new DomainFile();
    // domainsByHash: The OLD domains information
    // domainsByUrl: { url: hash} Domain url paired with the NEW hash of the domain
    const [domainsByHash, domainsByUrl] = await Promise.all([
      this.extractService.getDomainNodes(),
      domainNodesToImport.createNodeObjects(),
    ]);
    for (const { hash, url, name, views, down_attemps } of domainsByHash) {
      // The node has the same name and path, same hash
      if (domainNodesToImport.containsHash(hash)) {
        const domainNode = domainNodesToImport.getNode(hash);
        await this.updateNodeByName(domainNode);
        domainNodesToImport.popDomain(hash);
      }
      // Domain URL exist but the hash is not the same
      else if (domainsByUrl.hasOwnProperty(url)) {
        const domainNode = domainNodesToImport.getNode(domainsByUrl[url]);
        // It means that it has different path, if not the hash would be the same
        if (name === domainNode.name) {
          // Maybe WHERE node.name = name and node.url = url
          await this.deleteNode(hash);
          const newHash = domainsByUrl[url];
          down_attemps !== null && domainNodesToImport.setDownAttemps(newHash, down_attemps);
          views !== null && domainNodesToImport.setViews(newHash, views);
          this.logService.deletedNode(name);
        } else {
          const samePath = await this.extractService.hasSamePath(domainNode.path, url);
          if (samePath) {
            await this.updateNodeByUrl(domainNode);
            // Our hash is different because the name is different so,
            // get the new hash to delete from the list the domain
            domainNodesToImport.popDomain(domainsByUrl[url]);
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
    // There are nodes that previously exist or are new ones. Create the missing domain nodes
    if (!isEmpty(domainNodesToImport.getNodes())) {
      await this.createNewDomains(domainNodesToImport);
    }
  }

  async createNewDomains(domainNodesToImport: DomainFile) {
    const domainArray: IDomainExt[] = Object.values(domainNodesToImport.getNodes());
    let newDomain: IDomainExt;
    for (newDomain of domainArray) {
      await this.createNewListedDomain(newDomain);
      this.logService.domainAdded(newDomain.name);
    }
  }

  /**
   * Existed node which might have extra attributes as down_attemps or/and views
   * or fresh domains
   * @param node
   */
  async createNewListedDomain(node: IDomainExt) {
    if (node.views === null && node.down_attemps === null) {
      await this.updateNodeByName(node, false);
    } else {
      const { query, data } = createNewBrandDomainCypherQuery(node);
      await this.neo4jService.write(query, data);
    }
  }

  /**
   * The url has been changed but the hash still keeps: same path and same name
   * @param node
   * @param updated: The variable to control the log
   */
  async updateNodeByName(node: IDomainExt, updated = true) {
    try {
      const { query, data } = updateByNameCypherQuery(node);
      await this.neo4jService.write(query, data);
      updated && this.logService.updatedNode(node.name);
    } catch (e) {
      throwNeo4JError(e, node.name, NEO4J_ACTIONS.MERGE);
    }
  }

  /**
   * The name has been changed but the url still the same
   * @param node
   */
  async updateNodeByUrl(node: IDomainExt) {
    try {
      const { query, data } = updateByUrlCypherQuery(node);
      await this.neo4jService.write(query, data);
      this.logService.updatedNode(node.name);
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
