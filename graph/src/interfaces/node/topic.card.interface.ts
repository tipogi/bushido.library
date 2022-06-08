import { CardType } from "../../enumerators";

export interface ITopicCard {
  name: string;
  description: string;
  type: CardType;
  icon: string;
  nodeHash: string;
  path: string[];
}