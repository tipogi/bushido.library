// The object that we get from the bookmarks json files
export interface IDomain {
  name: string;
  description: string;
  url: string;
  icon: string;
  lang: string;
  tags: string[];
  views?: number;
  down_attemps?: number;
}

export interface IDomainExt extends IDomain {
  hash: string;
  path: string[];
}

export interface IDomainNodeList {
  [key: string]: IDomainExt;
}
