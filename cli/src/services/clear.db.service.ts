import { Injectable } from '@nestjs/common';
import { green, red, yellow, bold, italic } from 'colors';
import { QueryResult, Record } from 'neo4j-driver';
import { exceptionArray } from 'src/constants/exception-urls.constants';
import { BRANCH_WITHOUT_CHILD, LEAF_WITHOUT_CHILD } from 'src/helpers/constant.query';
import { Neo4jService } from 'src/utils/neo4j';
import { AxiosService } from './axios.service';
import { ExtractDBService } from './extract.db.service';
import { LogService } from './log.service';

interface IDeletedNode extends Record {
  name: string;
  hash: string;
}

interface IUnavailableNodes {
  url: string;
  hash: string;
}

@Injectable()
export class ClearDBService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly logService: LogService,
    private readonly axiosService: AxiosService,
    private readonly extractDBService: ExtractDBService,
  ) {}

  async deleteTopicsWithoutChildren() {
    const deleted_leaf = await this.neo4jService.write(LEAF_WITHOUT_CHILD);
    this.printDeletedNodes(deleted_leaf);
    const deletedBranch = await this.neo4jService.write(BRANCH_WITHOUT_CHILD);
    this.printDeletedNodes(deletedBranch);
  }

  printDeletedNodes = (deletedNodes: QueryResult) => {
    deletedNodes.records.forEach((row: IDeletedNode) => {
      const name = row.get('name');
      const hash = row.get('hash');
      this.logService.notChildTopicDeleted(name, hash);
    });
  };

  async checkDomainUrls() {
    const unavailableUrls: IUnavailableNodes[] = [];
    const domainsWithUrl = await this.extractDBService.getDomainWithUrls();
    for (const domain of domainsWithUrl) {
      const requestStartTime = Date.now();
      let message: string;
      const { url, hash } = domain;
      if (!exceptionArray.includes(url)) {
        const available = await this.axiosService.activeUrl(url);
        const requestTime = `${Date.now() - requestStartTime}ms`;
        // Returns error type
        if (typeof available === 'string') {
          message = red(`ERROR: ${available}, ping failed to ${italic(url)} domain takes ${bold(requestTime)}`);
        } else if (!available) {
          unavailableUrls.push({ url, hash });
          message = red(`UNAVAILABLE: Ping failed to ${italic(url)} domain`);
          // Add in the array of not available
        } else {
          message = green(`AVAILABLE: Ping to ${italic(url)} domain takes ${bold(requestTime)}`);
        }
      } else {
        message = yellow(`IGNORED: Ping to ${italic(url)} domain because it redirect to another domain`);
      }
      console.log(message);
    }
  }
}
