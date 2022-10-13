export interface IDomainCore {
  name: string;
  hash: string;
  url: string;
}

export interface IMinimisedDomain extends IDomainCore {
  views: number | null;
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
}

export interface IDomainByUrl {
  [key: string]: string;
}
