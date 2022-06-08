import { readFile } from 'fs/promises';
import { exit } from 'process';
import { CardType } from '../enumerators';
import crypto from 'crypto';
import { BNode, BOOKMARKS_FOLDER } from './BNode';
import { IDomainList } from '../interfaces';

export class Leaf extends BNode {

  private cards!: IDomainList;
  
  constructor (
    name: string, 
    description: string,
    type: CardType 
  ) {
    super(name, description, type)
  }

  // TODO: It does not show properly the path
  setCards (path: string, key: string): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const relativePath = `${BOOKMARKS_FOLDER}${path}`
        const extension = '.json';
        const jsonFile = await readFile(`${relativePath}${extension}`, 'utf8');
        const domains = JSON.parse(jsonFile);
        // The object that we get it has file name, so we just need to get the array, not the entire object
        if (Object.prototype.hasOwnProperty.call(domains, key)) {
          this.cards = domains[key];
        } else {
          throw `The Key does not exist in the file ${relativePath}${extension}`;
        }
        this.setHash(crypto.createHash('sha1').update(relativePath).digest('hex'));
        resolve(this.getHash());
      } catch (error: any) {
        console.log(`${BOOKMARKS_FOLDER}${path}`)
        if (error.code === 'ENOENT') {
          console.log('It does not exist ', error.path);
        } else {
          console.log(error)
        }
        exit(1);
        resolve('NoHash_PathERROR');
      }
    })
  }

  getCards() {
    return this.cards;
  }

  getFolderCard(key: string) {
    return Object.prototype.hasOwnProperty.call(this.cards, key) && this.cards[key];
  }
}