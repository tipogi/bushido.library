// The object that we get from the bookmarks json files
export interface IDomain {
  name: string;
  description: string;
  url: string;
  icon: string;
  lang: string;
  tags: string[];
}

export interface IDomainExt extends IDomain {
  hash: string;
  path: string[];
}

export interface IDomainNodeList {
  [key: string]: IDomainExt;
}
