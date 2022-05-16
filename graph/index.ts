import { readFile } from 'fs/promises';
import { exit } from 'process';
import { Folder } from './src/classes';
import { forEach } from 'lodash';

const BOOKMARKS_FOLDER = 'bookmarks';
const ROOT_FILE = 'index.json';

const generate = async () => {
  try {
    const FOLDER_ABSOLUTE_PATH = `../${BOOKMARKS_FOLDER}/${ROOT_FILE}`;
    const jsonFile = await readFile(FOLDER_ABSOLUTE_PATH, 'utf8');
    const folder: Folder = new Folder(jsonFile);
    digDeeper(FOLDER_ABSOLUTE_PATH, folder);
  } catch (e) {
    console.log(e)
    exit(1)
  }
}

const digDeeper = (path: string, folder: Folder) => {
  forEach(folder.getCards(), (card) => {
    console.log(card)
  })
}

generate();