import { readFile } from 'fs/promises';
import { exit } from 'process';
import { CardType } from '../enumerators';
import { IFolder } from "../interfaces";

export const BOOKMARKS_FOLDER = '../bookmarks';
const INDEX_FILE = 'index.json';

export class Folder {

  private cards!: IFolder;
  
  constructor (
    private type: string,
    private name: string = 'bushido'
  ) {}

  // TODO: It does not show properly the path
  async setCards (path: string) {
    try {
      const relativePath = `${BOOKMARKS_FOLDER}${path}`
      const file = this.type === CardType.LEAF ? '.json' : `/${INDEX_FILE}`;
      const jsonFile = await readFile(`${relativePath}${file}`, 'utf8');
      console.log(path)
      console.log(`${relativePath}${file}`)
      this.cards = JSON.parse(jsonFile)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('It does not exist ',error.path);
        exit(1);
      }
    }
  }

  getCards() {
    return this.cards;
  }

  getName() {
    return this.name;
  }

  getFolderCard(key: string) {
    return Object.prototype.hasOwnProperty.call(this.cards, key) && this.cards[key];
  }
}