import { CardType } from "../enumerators";

export const BOOKMARKS_FOLDER = '../bookmarks';

export class BNode {

  // Create a unique hash from root path
  private hash!: string;

  constructor(
    private name: string,
    private description: string,
    private type: CardType
  ) {}

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getType() {
    return this.type;
  }

  getHash() {
    return this.hash;
  }

  setHash(hash: string) {
    this.hash = hash;
  }
}