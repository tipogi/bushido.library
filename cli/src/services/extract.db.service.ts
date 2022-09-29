import { Injectable } from '@nestjs/common';
import { forEach } from 'lodash';
import { GET_DOMAINS } from 'src/helpers/nodes.query';
import { IDomainByHash, IDomainByUrl, IMinimisedDomain } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';

interface IGetDomainNodesRes {
  domainsByHash: IDomainByHash;
  domainsByUrl: IDomainByUrl;
}

@Injectable()
export class ExtractDBService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getDomainNodes(): Promise<IGetDomainNodesRes> {
    const res = await this.neo4jService.read(GET_DOMAINS);
    const domainList: IMinimisedDomain[] = res.records.map((row) => row.get('domain'));
    const [domainsByHash, domainsByUrl]: [IDomainByHash, IDomainByUrl] = [{}, {}];
    forEach(domainList, (minimisedDomain) => {
      domainsByHash[minimisedDomain.hash] = minimisedDomain;
      domainsByUrl[minimisedDomain.url] = minimisedDomain.hash;
    });
    return { domainsByHash, domainsByUrl };
  }
}
