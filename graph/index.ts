import { readFile } from 'fs/promises';
import { exit } from 'process';
import { BOOKMARKS_FOLDER, Folder } from './src/classes';
import { forEach } from 'lodash';
import { CardType } from './src/enumerators';

const nodes = {};

const generate = async () => {
  try {
    console.log('Running...')
    const folder: Folder = new Folder(CardType.ROOT);
    await folder.setCards('');
    digDeeper('', folder);
  } catch (e) {
    console.log(e)
    exit(1)
  }
}

const digDeeper = (parentPath: string | undefined, folder: Folder) => {
  forEach(folder.getCards(), async ({ type }, key) => {
    const relativePath = `${parentPath}/${key}`;
    console.log('--->',relativePath)
    const nestedFolder: Folder = new Folder(type, key);
    await nestedFolder.setCards(relativePath);
    if (type === CardType.ROOT || type === CardType.BRANCH) {
      digDeeper(relativePath, nestedFolder);
    } else if (type === CardType.LEAF) {
      console.log('folderName:', folder.getName())
    }
  })
}

generate();