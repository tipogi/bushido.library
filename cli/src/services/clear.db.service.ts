import { Injectable } from '@nestjs/common';
import { QueryResult, Record } from 'neo4j-driver';
import { BRANCH_WITHOUT_CHILD, LEAF_WITHOUT_CHILD } from 'src/helpers/constant.query';
import { Neo4jService } from 'src/utils/neo4j';
import { LogService } from './log.service';

interface IDeletedNode extends Record {
  name: string;
  hash: string;
}

@Injectable()
export class ClearDBService {
  constructor(private readonly neo4jService: Neo4jService, private readonly logService: LogService) {}

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
}
