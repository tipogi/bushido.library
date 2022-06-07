import { readFile } from 'fs/promises';
import { exit } from 'process';
import { CardType } from '../enumerators';
import { IFolder } from "../interfaces";

export const BOOKMARKS_FOLDER = '../bookmarks';
const INDEX_FILE = 'index.json';

export class Folder {

  private cards!: IFolder;
  private path!: string[]
  
  constructor (
    private type: string,
    private name: string = 'bushido',
    private description: string = '',
    // Create a unique hash from root path
    private hash: string = '905872aa0cfec9403765343fafe2590576947d8b'
  ) {}

  // TODO: It does not show properly the path
  async setCards (path: string) {
    try {
      const relativePath = `${BOOKMARKS_FOLDER}${path}`
      const file = this.type === CardType.LEAF ? '.json' : `/${INDEX_FILE}`;
      const jsonFile = await readFile(`${relativePath}${file}`, 'utf8');
      /*console.log(path)
      console.log(`${relativePath}${file}`)*/
      this.cards = JSON.parse(jsonFile)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('It does not exist ',error.path);
        exit(1);
      }
    }
  }

  setPath(path: string[]) {
    this.path = path;
  }

  getCards() {
    return this.cards;
  }

  getName() {
    return this.name;
  }

  getHash() {
    return this.hash;
  }

  getFolderCard(key: string) {
    return Object.prototype.hasOwnProperty.call(this.cards, key) && this.cards[key];
  }
}