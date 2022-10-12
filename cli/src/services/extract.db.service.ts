import { Injectable } from '@nestjs/common';
import { createDomainNode, GET_DOMAINS, GET_DOMAINS_BY_URL, hasURL } from 'src/helpers/query.generator';
import { IDomainCore, IMinimisedDomain } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';

@Injectable()
export class ExtractDBService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getDomainNodes(): Promise<IMinimisedDomain[]> {
    const res = await this.neo4jService.read(GET_DOMAINS);
    const domainsByHash: IMinimisedDomain[] = res.records.map((row) => row.get('domain'));
    return domainsByHash;
  }

  async getDomainWithUrls(): Promise<IDomainCore[]> {
    const res = await this.neo4jService.read(GET_DOMAINS_BY_URL);
    const domainByUrl: IDomainCore[] = res.records.map((row) => row.get('domain'));
    return domainByUrl;
  }

  /**
   * Check if still the URL has the same path
   * @param path: Updated node path
   * @param url: Actual graph node url
   * @returns boolean
   */
  async hasSamePath(path: string[], url: string): Promise<boolean> {
    const parentPath: string = createDomainNode(path);
    const childPath: string = hasURL(url);
    const EXIST_PATH = parentPath + childPath;
    const urlHasSamePath = await this.neo4jService.read(EXIST_PATH);
    return urlHasSamePath.records.length > 0;
  }
}
