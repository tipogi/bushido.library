import { CardType } from "../enumerators";

export interface ICard {
  name: string;
  description: string;
  type: CardType;
  icon: string;
}