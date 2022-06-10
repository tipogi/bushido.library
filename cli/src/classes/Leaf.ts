import { readFile } from 'fs/promises';
import { exit } from 'process';
import { CardType } from '../enumerators';
import * as crypto from 'crypto';
import { BNode, BOOKMARKS_FOLDER } from './BNode';
import { IDomain, IDomainCard } from '../interfaces';
import { map } from 'lodash';
import { red } from 'colors';

/**
 * Node type responsible to store all the related domains
 */
export class Leaf extends BNode {
  private cards!: IDomainCard[];

  constructor(name: string, description: string, type: CardType) {
    super(name, description, type);
  }

  /**
   * Read the related JSON file to store in cards attributte the domains
   * @param path
   * @param key
   * @returns
   */
  setCards(path: string, key: string): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const relativePath = `${BOOKMARKS_FOLDER}${path}`;
        const extension = '.json';
        const jsonFile = await readFile(`${relativePath}${extension}`, 'utf8');
        const domains = JSON.parse(jsonFile);
        // The object that we get it has file name, so we just need to get the array, not the entire object
        if (Object.prototype.hasOwnProperty.call(domains, key)) {
          this.cards = map(domains[key], (domain: IDomain) => ({
            ...domain,
            path: relativePath.split('/').slice(2),
            hash: crypto
              .createHash('sha1')
              .update(`${relativePath}/${domain.name}`)
              .digest('hex'),
          }));
        } else {
          throw `The Key does not exist in the file ${relativePath}${extension}`;
        }
        this.setHash(
          crypto.createHash('sha1').update(relativePath).digest('hex'),
        );
        resolve(this.getHash());
      } catch (error: any) {
        console.log(`${BOOKMARKS_FOLDER}${path}`);
        if (error.code === 'ENOENT') {
          console.log(red(`It does not exist ${error.path}`));
        } else {
          console.log(red(error));
        }
        exit(1);
      }
    });
  }

  getCards() {
    return this.cards;
  }
}
