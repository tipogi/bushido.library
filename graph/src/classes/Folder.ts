import { IFolder } from "../interfaces";

export class Folder {

  private cards: IFolder;
  
  constructor(jsonObject: string) {
    this.cards = JSON.parse(jsonObject)
  }

  getCards() {
    return this.cards;
  }

  getFolderCard(key: string) {
    return Object.prototype.hasOwnProperty.call(this.cards, key) && this.cards[key];
  }
}