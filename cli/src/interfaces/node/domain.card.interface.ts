export interface IDomainCard {
  name: string;
  description: string;
  url: string;
  icon: string;
  lang: string;
  tags: string[];
  // Has to be generated on the go
  path: string[];
  hash: string;
}
