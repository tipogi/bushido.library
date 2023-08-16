import { Injectable } from '@nestjs/common';

import { Branch, Graph, Leaf } from '../classes';
import { map } from 'lodash';
import { CardType } from '../constants/enumerators';

import { IDomainCard, ITopicCard } from 'src/interfaces';
import { LogService } from './log.service';

const graph = new Graph();

@Injectable()
export class FileGeneratorService {
  constructor(private readonly logService: LogService) {}
  async generateFiles(): Promise<ITopicCard[]> {
    try {
      // Create the ROOT node to start analyzing the files
      const folder: Branch = new Branch('Bushido', 'Fast Access', CardType.ROOT);
      await folder.setCards('');
      // Start the search and create the graph
      await this.digDeeper('', folder);
      // Once identify the topics and the domains, create the JSON files to after import in Neo4J
      await graph.createJSONFiles();
      return graph.getTopics();
    } catch (e) {
      this.logService.printOutError(e);
    }
  }

  /**
   * Analyse folder files
   * @param parentPath: string - The path that contains the files that we need to analyse
   * @param folder: Branch | Leaf - The parent information of that folder
   * @returns
   */
  async digDeeper(parentPath: string | undefined, folder: Branch) {
    try {
      return await Promise.all(
        map(folder.getCards(), async ({ type, description, icon, access }, key) => {
          const relativePath = `${parentPath}/${key}`;
          const pathInChunks = relativePath.split('/').slice(1);
          return await new Promise(async (resolve) => {
            if (type === CardType.ROOT || type === CardType.BRANCH) {
              const branchNode: Branch = new Branch(key, description, type);
              const nodeHash = await branchNode.setCards(relativePath);
              this.logService.addTopicInTheFile(key, type, relativePath);
              graph.addTopic({
                name: key,
                description,
                nodeHash,
                path: pathInChunks,
                type,
                icon,
                access,
              });
              await this.digDeeper(relativePath, branchNode);
            } else if (type === CardType.LEAF) {
              const leafNode: Leaf = new Leaf(key, description, type);
              const nodeHash = await leafNode.setCards(relativePath, key);
              this.logService.addTopicInTheFile(key, type, relativePath);
              graph.addTopic({
                name: key,
                description,
                nodeHash,
                path: pathInChunks,
                type,
                icon,
              });
              await this.extractLeafDomains(leafNode);
            }
            resolve('ok');
          });
        }),
      );
    } catch (e) {
      this.logService.printOutError(e);
    }
  }

  /**
   * Once we reach the leaf of the path, extract all the domains
   * @param leafNode: Leaf
   * @returns
   */
  async extractLeafDomains(leafNode: Leaf) {
    return await Promise.all(
      map(leafNode.getCards(), (domain: IDomainCard) => {
        return new Promise((resolve) => {
          this.logService.addDomainInTheFile(domain.name);
          graph.addDomain({ ...domain });
          resolve('ok');
        });
      }),
    );
  }
}
