import { Injectable } from '@nestjs/common';

import { Branch, Graph, Leaf } from '../classes';
import { map } from 'lodash';
import { CardType } from '../enumerators';
import { blue, red, yellow } from 'colors';

import { exit } from 'process';

const graph = new Graph();

@Injectable()
export class FileGeneratorService {
  async generateFiles() {
    try {
      // Create the ROOT node to start analyzing the files
      const folder: Branch = new Branch('Bushido', 'Fast Access', CardType.ROOT);
      await folder.setCards('');
      // Start the search and create the graph
      await digDeeper('', folder);
      // Once identify the topics and the domains, create the JSON files to after import in Neo4J
      await graph.createJSONFiles();
    } catch (e) {
      console.log(red(e));
      exit(1);
    }
  }
}

/**
 * Analyse folder files
 * @param parentPath: string - The path that contains the files that we need to analyse
 * @param folder: Branch | Leaf - The parent information of that folder
 * @returns
 */
const digDeeper = async (parentPath: string | undefined, folder: Branch) => {
  try {
    return await Promise.all(
      map(folder.getCards(), async ({ type, description }, key) => {
        const relativePath = `${parentPath}/${key}`;
        const pathInChunks = relativePath.split('/').slice(1);
        return await new Promise(async (resolve) => {
          if (type === CardType.ROOT || type === CardType.BRANCH) {
            const branchNode: Branch = new Branch(key, description, type);
            const nodeHash = await branchNode.setCards(relativePath);
            console.log(
              `Adding ${blue(`#${key}`)} topic, node type: ${blue(`${type}`)}, relative path: ${relativePath}`,
            );
            graph.addTopic({
              name: key,
              description,
              nodeHash,
              path: pathInChunks,
              type,
            });
            await digDeeper(relativePath, branchNode);
          } else if (type === CardType.LEAF) {
            const leafNode: Leaf = new Leaf(key, description, type);
            const nodeHash = await leafNode.setCards(relativePath, key);
            console.log(
              `Adding ${blue(`#${key}`)} topic, node type: ${blue(`${type}`)}, relative path: ${relativePath}`,
            );
            graph.addTopic({
              name: key,
              description,
              nodeHash,
              path: pathInChunks,
              type,
            });
            await extractLeafDomains(leafNode);
          }
          resolve('ok');
        });
      }),
    );
  } catch (e) {
    console.log(red(e));
  }
};

/**
 * Once we reach the leaf of the path, extract all the domains
 * @param leafNode: Leaf
 * @returns
 */
const extractLeafDomains = async (leafNode: Leaf) => {
  return await Promise.all(
    map(leafNode.getCards(), (domain) => {
      return new Promise((resolve) => {
        console.log(`\tAdding ${yellow(`@${domain.name}`)} domain`);
        graph.addDomain({ ...domain });
        resolve('ok');
      });
    }),
  );
};
