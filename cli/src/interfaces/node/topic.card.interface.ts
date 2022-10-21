import { CardType } from '../../constants/enumerators';

export interface ITopicCard {
  name: string;
  description: string;
  type: CardType;
  icon: string;
  nodeHash: string;
  path: string[];
  access?: string;
}
