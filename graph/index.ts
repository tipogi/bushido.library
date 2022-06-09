import { Branch, Graph, Leaf } from './src/classes';
import { map } from 'lodash';
import { CardType } from './src/enumerators';
import { green, blue, yellow,  } from 'colors';

import { exit } from 'process';

const graph = new Graph();

const generate = async () => {
  try {
    console.log('==> Running...')
    const folder: Branch = new Branch('Bushido', 'Fast access', CardType.ROOT);
    await folder.setCards('');
    await digDeeper('', folder);
    await graph.createJSONFiles();
    console.log('done')
  } catch (e) {
    console.log(e)
    exit(1)
  }
}

const digDeeper = async (parentPath: string | undefined, folder: Branch) => {
  try {
    return await Promise.all(map(folder.getCards(), async({ type, description }, key) => {
      const relativePath = `${parentPath}/${key}`;
      const pathInChunks = relativePath.split('/').slice(1);
      return await new Promise(async (resolve) => {
        if (type === CardType.ROOT || type === CardType.BRANCH) {
          const branchNode: Branch = new Branch(key, description, type);
          const nodeHash = await branchNode.setCards(relativePath);
          console.log(`Adding ${blue(`#${key}`)} topic, node type: ${blue(`${type}`)}, relative path: ${relativePath}`);
          graph.addTopic({ name: key, description, nodeHash, path: pathInChunks, type })
          await digDeeper(relativePath, branchNode);
        } else if (type === CardType.LEAF) {
          const leafNode: Leaf = new Leaf(key, description, type);
          const nodeHash = await leafNode.setCards(relativePath, key);
          console.log(`Adding ${blue(`#${key}`)} topic, node type: ${blue(`${type}`)}, relative path: ${relativePath}`);
          graph.addTopic({ name: key, description, nodeHash, path: pathInChunks, type })
          await extractLeafDomains(leafNode);
        }
        resolve('ok')
      })
    }))
  } catch (e) {
    console.log(e);
  }
}

const extractLeafDomains = async(leafNode: Leaf) => {
  return await Promise.all(map(leafNode.getCards(), (domain) => {
    return new Promise((resolve) => {
      console.log(`\tAdding ${yellow(`@${domain.name}`)} domain`);
      graph.addDomain({ ...domain })
      resolve('ok')
    })
  }));
}

generate();