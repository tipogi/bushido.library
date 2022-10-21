import { Integer } from 'neo4j-driver';

export interface IDomainCore {
  name: string;
  hash: string;
  url: string;
}

export interface IMinimisedDomain extends IDomainCore {
  views: number | null;
  down_attemps: number | null;
}

export interface INeo4JDomainAvailability {
  hash: string;
  url: string;
  down_attemps: Integer;
}

export interface IDomainAvailability {
  hash: string;
  url: string;
  down_attemps: number;
}

export interface IDomainStates {
  down: IDomainAvailability[];
  up: IDomainAvailability[];
}

export interface IDomainCard extends IDomainCore {
  description: string;
  icon: string;
  lang: string;
  tags: string[];
  // Has to be generated on the go
  path: string[];
  views?: number | null;
  down_attemps?: number | null;
}

export interface IDomainByUrl {
  [key: string]: string;
}
