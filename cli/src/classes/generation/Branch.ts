import { readFile } from 'fs/promises';
import { exit } from 'process';
import { CardType } from '../../enumerators';
import { ITopicList } from '../../interfaces';
import * as crypto from 'crypto';
import { BNode, BOOKMARKS_FOLDER } from './BNode';

const INDEX_FILE = 'index.json';

/**
 * The node types that has hanging some LEAF or BRANCH
 */
export class Branch extends BNode {
  private cards!: ITopicList;

  constructor(name = 'bushido', description = '', type: CardType) {
    super(name, description, type);
  }

  // TODO: It does not show properly the path
  setCards(path: string): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const relativePath = `${BOOKMARKS_FOLDER}${path}`;
        this.getType() === CardType.ROOT ? console.log(relativePath) : undefined;
        const file = `/${INDEX_FILE}`;
        const jsonFile = await readFile(`${relativePath}${file}`, 'utf8');
        this.cards = JSON.parse(jsonFile);
        this.setHash(crypto.createHash('sha1').update(relativePath).digest('hex'));
        resolve(this.getHash());
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('It does not exist', error.path);
          exit(1);
        }
        resolve('NoHash_PathERROR');
      }
    });
  }

  getCards(): ITopicList {
    return this.cards;
  }

  getFolderCard(key: string) {
    return Object.prototype.hasOwnProperty.call(this.cards, key) && this.cards[key];
  }
}
