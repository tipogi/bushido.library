import { Injectable } from '@nestjs/common';
import { green, red, yellow, magenta, Color } from 'colors';
import { QueryResult, Record } from 'neo4j-driver';
import { exceptionArray } from 'src/constants/exception-urls.constants';
import { BRANCH_WITHOUT_CHILD, LEAF_WITHOUT_CHILD } from 'src/helpers/constant.query';
import { IDomainAvailability, IDomainStates, INeo4JDomainAvailability, ISimpleNode, ITopicCard } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';
import { AxiosService } from './axios.service';
import { ExtractDBService } from './extract.db.service';
import { IPrintOut, LogService } from './log.service';
import { PopulateDBService } from './populate.db.service';
import { forEach, has, includes } from 'lodash';
import { CardType } from 'src/constants/enumerators/card.enum';
import { DELETE_EVOLVED_NODES } from 'src/helpers/query.generator';

// The ping amount before delete the domain
const MAX_ATTEMPS = 8;
// When the host is not available anymore
const HOST_UNREACHEABLE = 'Host unreacheable';

interface IDeletedNode extends Record {
  name: string;
  hash: string;
}

@Injectable()
export class ClearDBService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly logService: LogService,
    private readonly axiosService: AxiosService,
    private readonly extractDBService: ExtractDBService,
    private readonly populateDBService: PopulateDBService,
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
      let message_color: IPrintOut;
      const { url } = domain;
      if (!exceptionArray.includes(url)) {
        const available = await this.axiosService.activeUrl(url);
        message_color = this.printResponseStatus(available, requestStartTime, domainStates, domain);
      } else {
        message_color = {
          color: yellow,
          message: `IGNORED: Ping to ${url} domain because it redirects to another domain`,
        };
      }
      this.logService.printOutput(message_color);
    }
    await this.editDomainFailAttemps(domainStates);
  }

  async analyseTopicHash(topicJSON: ITopicCard[]): Promise<number> {
    const simpleTopicNodes = this.formatTopicNodes(topicJSON);
    const actualLeafNodes = await this.extractDBService.getLeafNodes();
    const expandedNodes: String[] = [];
    forEach(simpleTopicNodes, ({ hash, type }) => {
      if (includes(actualLeafNodes, hash) && type === CardType.BRANCH) {
        expandedNodes.push(hash);
      }
    });
    // Delete the evolved nodes that now they are going to be converted in BRANCHes
    for (let hash of expandedNodes) {
      const deletedNode = await this.neo4jService.write(DELETE_EVOLVED_NODES, { hash });
      const { name, description } = deletedNode.records[0]?.get('leaf')
      const message = `==> deleted ${name.toUpperCase()} node: ${description} because it evolve to a BRANCH`;
      this.logService.printOutput({ message, color: red });
    }
    return expandedNodes.length;
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
    { url, hash, down_attemps }: INeo4JDomainAvailability,
  ): IPrintOut {
    let message: string;
    let color: Color;
    let availableDomain = true;
    const requestTime = `${Date.now() - requestStartTime}ms`;
    // Returns error type
    if (typeof available === 'string') {
      if (available === HOST_UNREACHEABLE) {
        availableDomain = false;
        const atttemps = down_attemps === null ? 0 : down_attemps.toNumber();
        domainStates.down.push({ url, hash, down_attemps: atttemps });
        message = `UNREACHABLE: Ping failed to ${url} domain. 'Not Exist' error!`;
        color = red;
      } else {
        message = `NOT_HEALTY (${available}): Ping response from ${url} domain took ${requestTime}`;
        color = yellow;
      }
    } else if (typeof available === 'number') {
      if (available === 200) {
        message = `AVAILABLE: Ping to ${url} domain took ${requestTime}`;
        color = green;
      } else if (available === 404) {
        // I do not think we should threat as not available domain that error. That page does not exist in that domain. TODO
        /*availableDomain = false;
        const atttemps = down_attemps === null ? 0 : down_attemps.toNumber();
        domainStates.down.push({ url, hash, down_attemps: atttemps });*/
        message = `UNAVAILABLE (404): Ping failed to ${url} domain. 'Not Found' error!`;
        color = red;
      } else if (available === 0) {
        message = `TOR SERVICE DOWN (spin up market container): We could not ping to ${url}`;
        color = magenta;
      } else {
        message = `NOT_HEALTY (${available}): Ping response from ${url} domain took ${requestTime}`;
        color = yellow;
      }
    } else {
      message = `AVAILABLE: Ping to ${url} domain took ${requestTime}`;
      color = green;
    }
    // It means previously was down the domain, but actually it is accesible again
    if (availableDomain && down_attemps !== null && down_attemps.toNumber() > 0) {
      domainStates.up.push({ url, hash, down_attemps: down_attemps.toNumber() });
    }
    return { message, color };
  }

  async editDomainFailAttemps(domainStates: IDomainStates) {
    await Promise.all([
      this.setUnavailablePointToDomain(domainStates.down),
      this.setAvailableStateToDomain(domainStates.up),
    ]);
  }

  async setUnavailablePointToDomain(notAvailableDomains: IDomainAvailability[]) {
    for (const { hash, down_attemps, url } of notAvailableDomains) {
      // The crontab will run each 5 days so, that case means that it was down the domain more than a month
      // In this scenario, it will delete the domain
      if (down_attemps > MAX_ATTEMPS) {
        const outputMessage = {
          message: `DELETED: The ${url} domain has reached the maximum attemps of PING. Deleting the domain (${hash})`,
          color: red,
        };
        this.logService.printOutput(outputMessage);
        await this.populateDBService.deleteNode(hash);
      } else {
        const attemps = down_attemps === null ? 1 : down_attemps + 1;
        await this.extractDBService.editDomainDownAttemps(hash, attemps, url, 'DOWN');
      }
    }
  }

  async setAvailableStateToDomain(availableDomains: IDomainAvailability[]) {
    for (const { hash, url } of availableDomains) {
      await this.extractDBService.editDomainDownAttemps(hash, 0, url, 'UP');
    }
  }

  formatTopicNodes(topicJSON: ITopicCard[]): ISimpleNode[] {
    const leafNodes: ISimpleNode[] = [];
    // Format node to check the node type
    forEach(topicJSON, ({ nodeHash, type }) => leafNodes.push({ hash: nodeHash, type }))
    return leafNodes;
  }
}
