import { Branch, Graph, Leaf } from './src/classes';
import { map } from 'lodash';
import { CardType } from './src/enumerators';

import { exit } from 'process';

const graph = new Graph();

const generate = async () => {
  try {
    console.log('==> Running...')
    const folder: Branch = new Branch('Bushido', 'Fast access', CardType.ROOT);
    await folder.setCards('');
    const k = await digDeeper('', folder);
    //graph.getTopic();
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
          //console.log(nestedFolder.getCards())
          graph.addTopic({ name: key, description, nodeHash, path: pathInChunks, type })
          await digDeeper(relativePath, branchNode);
          //resolve({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type });
        } else if (type === CardType.LEAF) {
          const leafNode: Leaf = new Leaf(key, description, type);
          const nodeHash = await leafNode.setCards(relativePath, key);
          graph.addTopic({ name: key, description, nodeHash, path: pathInChunks, type })
          await extractLeafDomains(relativePath, leafNode);
        }
        resolve('ok')
      })
    }))
  } catch (e) {
    console.log(e);
  }
}

const extractLeafDomains = async(relativePath: string, nestedFolder: Leaf) => {
  /*console.log(nestedFolder.getName())*/
  console.log(nestedFolder.getCards())
  return new Promise((resolve) => resolve('oks'))
  //const leafNode: Domain = new Domain(key, description, type);
  //const nodeHash = crypto.createHash('sha1').update(relativePath).digest('hex');
  //console.log(relativePath, nestedFolder.getName())
  //graphTopics.push({ name: nestedFolder.getName(), description: nestedFolder.getDescription(), nodeHash, path: relativePath.split('/').slice(1), type: nestedFolder.getType() })
}

generate();

/*
const digDeeper = async (parentPath: string | undefined, folder: Folder) => {
  try {
    //console.log(folder.getCards())
    forEach(folder.getCards(), async ({ type, description }, key) => {
      const relativePath = `${parentPath}/${key}`;
      const nodeHash = crypto.createHash('sha1').update(relativePath).digest('hex')
      const nestedFolder: Folder = new Folder(type, key, description, nodeHash);
      await nestedFolder.setCards(relativePath);
      if (type === CardType.ROOT) {
        nestedFolder.setPath(relativePath.split('/').slice(1))
        //console.log(relativePath.split('/').slice(1));
        graphTopics.push({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type });
        console.log('push -->', relativePath)
        //Create the folders and the index.json file
        await digDeeper(relativePath, nestedFolder);
      } else if (type === CardType.BRANCH) {
        // Create folder and add in the file. From now in an array
        nestedFolder.setPath(relativePath.split('/').slice(1))
        //console.log(relativePath.split('/').slice(1));
        graphTopics.push({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type });
        console.log('push -->', relativePath)
        await digDeeper(relativePath, nestedFolder);
      }
      // Still is branch looking as a graph design but as a file system is our leaf
      // Read the [leaf].json and add all the domains as a LEAF
      else if (type === CardType.LEAF) {
        nestedFolder.setPath(relativePath.split('/').slice(1))
        //console.log(relativePath.split('/').slice(1));
        graphTopics.push({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type })
        console.log('push -->', relativePath)
        //await appendFile('../bookmarks/write.json', JSON.stringify({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type }) + "\n")
        extractLeafDomains(relativePath, nestedFolder);
      }
    })
  } catch (e) {
    console.log(e)
  }
  // That one is wrong, we should do the writing just once not each time that we enter in that function
  console.log('write in file...');
  console.log('graph Length', graphTopics.length)
}
*/