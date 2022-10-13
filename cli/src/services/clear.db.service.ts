import { Injectable } from '@nestjs/common';
import { green, red, yellow, bold, italic, underline } from 'colors';
import { QueryResult, Record } from 'neo4j-driver';
import { exceptionArray } from 'src/constants/exception-urls.constants';
import { BRANCH_WITHOUT_CHILD, LEAF_WITHOUT_CHILD } from 'src/helpers/constant.query';
import { IDomainAvailability, IDomainStates } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';
import { AxiosService } from './axios.service';
import { ExtractDBService } from './extract.db.service';
import { LogService } from './log.service';

interface IDeletedNode extends Record {
  name: string;
  hash: string;
}

const DOMAINS_STATE = {
  down: [
    {
      url: 'https://estudiobitcoin.com/me',
      hash: '5f6b4d96ee4d34d7b91ab5df7ddbe36c61cde55b',
      down_attemps: null,
    },
  ],
  up: [
    {
      url: 'https://www.lopp.net/',
      hash: '0c8c850259011b585d43a882575f888b8e023439',
      down_attemps: 2,
    },
    {
      url: 'https://diverter.hostyourown.tools/',
      hash: 'f487054b2724a032021a238521985315d69e6d81',
      down_attemps: 1,
    },
  ],
};

@Injectable()
export class ClearDBService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly logService: LogService,
    private readonly axiosService: AxiosService,
    private readonly extractDBService: ExtractDBService,
  ) {}

  /**
   * Optimise the bushido graph, if some domain or branch does not have any child
   */
  async deleteTopicsWithoutChildren() {
    const deleted_leaf = await this.neo4jService.write(LEAF_WITHOUT_CHILD);
    this.printDeletedNodes(deleted_leaf);
    const deletedBranch = await this.neo4jService.write(BRANCH_WITHOUT_CHILD);
    this.printDeletedNodes(deletedBranch);
  }

  /**
   * Check the availability of the domains. If some domain is down we need to marked
   */
  async checkDomainUrls() {
    const domainStates: IDomainStates = { down: [], up: [] };
    const domainsWithUrl = await this.extractDBService.getDomainWithUrls();
    for (const domain of domainsWithUrl) {
      const requestStartTime = Date.now();
      let message: string;
      const { url } = domain;
      if (!exceptionArray.includes(url)) {
        const available = await this.axiosService.activeUrl(url);
        message = this.printResponseStatus(available, requestStartTime, domainStates, domain);
      } else {
        message = yellow(`IGNORED: Ping to ${italic(url)} domain because it redirects to another domain`);
      }
      this.logService.printOutput(message);
    }
    await this.editDomainFailAttemps(domainStates);
  }

  /************ HELPER FUNCTIONS ****************/
  printDeletedNodes = (deletedNodes: QueryResult) => {
    deletedNodes.records.forEach((row: IDeletedNode) => {
      const name = row.get('name');
      const hash = row.get('hash');
      this.logService.notChildTopicDeleted(name, hash);
    });
  };

  printResponseStatus(
    available: string | number,
    requestStartTime: number,
    domainStates: IDomainStates,
    { url, hash, down_attemps }: IDomainAvailability,
  ) {
    let message: string;
    let availableDomain = true;
    const requestTime = `${Date.now() - requestStartTime}ms`;
    // Returns error type
    if (typeof available === 'string') {
      message = yellow(`NOT_HEALTY (${available}): Ping response from ${italic(url)} domain took ${bold(requestTime)}`);
    } else if (typeof available === 'number') {
      if (available === 200) {
        message = green(`AVAILABLE: Ping to ${italic(url)} domain took ${bold(requestTime)}`);
      } else if (available === 404) {
        availableDomain = false;
        domainStates.down.push({ url, hash, down_attemps });
        message = red(`UNAVAILABLE (404): Ping failed to ${italic(url)} domain. ${underline('Not Found')} error!`);
      } else {
        message = yellow(
          `NOT_HEALTY (${available}): Ping response from ${italic(url)} domain took ${bold(requestTime)}`,
        );
      }
    } else {
      message = green(`AVAILABLE: Ping to ${italic(url)} domain took ${bold(requestTime)}`);
    }
    // It means previously was down the domain, but actually it is accesible again
    if (availableDomain && down_attemps !== null && down_attemps > 0) {
      domainStates.up.push({ url, hash, down_attemps });
    }
    return message;
  }

  async editDomainFailAttemps(domainStates: IDomainStates) {
    const done = await Promise.all([
      this.setUnavailablePointToDomain(domainStates.down),
      this.setAvailableStateToDomain(domainStates.up),
    ]);
    console.log(done);
  }

  setUnavailablePointToDomain(notAvailableDomains: IDomainAvailability[]) {
    return new Promise(async (resolve) => {
      for (const { hash, down_attemps } of notAvailableDomains) {
        console.log(hash, down_attemps);
        // The crontab will run each 5 days so, that case means that it was down the domain more than a month
        // In this scenario, it will delete the domain
        if (down_attemps > 5) {
        } else {
          const attemps = down_attemps === null ? 1 : down_attemps + 1;
          const res = await this.extractDBService.editDomainDownAttemps(hash, attemps);
          console.log(res);
        }
      }
      resolve('ok');
    });
  }

  setAvailableStateToDomain(availableDomains: IDomainAvailability[]) {
    return new Promise(async (resolve) => {
      for (const domain of availableDomains) {
        console.log('upAgain', domain);
        const res = await this.extractDBService.editDomainDownAttemps(domain.hash, 0);
        console.log(res);
      }
      resolve('ok');
    });
  }
}
