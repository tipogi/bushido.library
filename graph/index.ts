import { appendFile, writeFile } from 'fs/promises';
import { exit } from 'process';
import { BOOKMARKS_FOLDER, Folder } from './src/classes';
import { forEach } from 'lodash';
import { CardType } from './src/enumerators';
import crypto from 'crypto';

interface FolderNodes {
  name: string;
  description: string;
  nodeHash: string;
  path: string[];
  type: CardType;
}

const nodes = {};
const folders: FolderNodes[] = [];

const generate = async () => {
  try {
    console.log('==> Running...')
    const folder: Folder = new Folder(CardType.ROOT);
    await folder.setCards('');
    await digDeeper('', folder);
  } catch (e) {
    console.log(e)
    exit(1)
  }
}

const digDeeper = async (parentPath: string | undefined, folder: Folder) => {
  try {
  //console.log(folder.getCards())
  forEach(folder.getCards(), async ({ type, description }, key) => {
    const relativePath = `${parentPath}/${key}`;
    const nodeHash = crypto.createHash('sha1').update(relativePath).digest('hex')
    /*console.log('--->',relativePath.split('/').slice(1), relativePath)
    console.log('HASH ==> ',nodeHash)*/
    const nestedFolder: Folder = new Folder(type, key, description, nodeHash);
    await nestedFolder.setCards(relativePath);
    if (type === CardType.ROOT) {
      //Create the folders and the index.json file
      digDeeper(relativePath, nestedFolder);
    } else if (type === CardType.BRANCH) {
      // Create folder and add in the file. From now in an array
      nestedFolder.setPath(relativePath.split('/').slice(1))
      console.log(relativePath.split('/').slice(1));
      folders.push({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type });
      digDeeper(relativePath, nestedFolder);
    }
    // Still is branch looking as a graph design but as a file system is our leaf
    // Read the [leaf].json and add all the domains as a LEAF
    else if (type === CardType.LEAF) {
      nestedFolder.setPath(relativePath.split('/').slice(1))
      console.log(relativePath.split('/').slice(1));
      folders.push({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type })
      //await appendFile('../bookmarks/write.json', JSON.stringify({ name: key, description, nodeHash, path: relativePath.split('/').slice(1), type }) + "\n")
    }
  })
  } catch (e) {
    console.log(e)
  }
  // That one is wrong, we should do the writing just once not each time that we enter in that function
  console.log('write in file....');
  await writeFile('../bookmarks/write.json', JSON.stringify(folders))
}

generate();