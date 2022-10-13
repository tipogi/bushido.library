import { Injectable } from '@nestjs/common';
import { green, yellow } from 'colors';
import {
  createDomainNode,
  editDomainDownAttempsQuery,
  GET_DOMAINS,
  GET_DOMAINS_BY_URL,
  hasURL,
} from 'src/helpers/query.generator';
import { IMinimisedDomain, INeo4JDomainAvailability } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';
import { LogService } from './log.service';

@Injectable()
export class ExtractDBService {
  constructor(private readonly neo4jService: Neo4jService, private readonly logService: LogService) {}

  async getDomainNodes(): Promise<IMinimisedDomain[]> {
    const res = await this.neo4jService.read(GET_DOMAINS);
    const domainsByHash: IMinimisedDomain[] = res.records.map((row) => row.get('domain'));
    return domainsByHash;
  }

  async getDomainWithUrls(): Promise<INeo4JDomainAvailability[]> {
    const res = await this.neo4jService.read(GET_DOMAINS_BY_URL);
    const domainByUrl: INeo4JDomainAvailability[] = res.records.map((row) => row.get('domain'));
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

  async editDomainDownAttemps(hash: string, down_attemps: number, url: string, state: string) {
    const query = editDomainDownAttempsQuery(hash, down_attemps);
    await this.neo4jService.write(query);
    const color = state === 'DOWN' ? yellow : green;
    this.logService.printOutput(color(`${url} domain is ${state} and we set with ${down_attemps} down attemps`));
  }
}
