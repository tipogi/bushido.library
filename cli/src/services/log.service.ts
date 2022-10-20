import { Injectable } from '@nestjs/common';
import { blue, bold, Color, green, red, underline, yellow } from 'colors';
import { exit } from 'process';
import { CardType } from 'src/constants/enumerators';
import {
  DOMAIN_DELETED_PATH,
  DOMAIN_UNAVAILABLE_PATH,
  NODE_FILES_PATH,
  NODE_IMPORT_PATH,
  SystemService,
} from './system.service';

export interface IPrintOut {
  message: string;
  color: Color;
}

@Injectable()
export class LogService {
  constructor(private readonly systemService: SystemService) {}
  printOutError(error: string) {
    console.log(red(error));
    exit(1);
  }
  /********* 1.FILE CREATION LOGS **************/
  addTopicInTheFile(key: string, type: CardType, relativePath: string) {
    console.log(`Adding ${blue(`#${key}`)} topic, node type: ${blue(`${type}`)}, absolute path: ${relativePath}`);
    const rawMessage = `Adding #${key} topic, node type: ${type}, absolute path: ${relativePath}\n`;
    this.systemService.writeInTheFile(NODE_FILES_PATH, rawMessage);
  }

  addDomainInTheFile(name: string) {
    console.log(`\tAdding ${yellow(`@${name}`)} domain`);
    const rawMessage = `Adding @${name} domain\n`;
    this.systemService.writeInTheFile(NODE_FILES_PATH, rawMessage);
  }
  /********* 2.IMPORT GENERATED FILES **************/

  topicAdded(name: string) {
    console.log(`${green('CREATED')} the topic ${bold(green(name))}, added in the graph`);
    const rawMessage = `CREATED the topic ${name}, added in the graph\n`;
    this.systemService.writeInTheFile(NODE_IMPORT_PATH, rawMessage);
  }

  domainAdded(name: string) {
    console.log(`${green('CREATED')} the domain "${bold(green(name))}", added in the graph`);
    const rawMessage = `CREATED the domain "${name}", added in the graph\n`;
    this.systemService.writeInTheFile(NODE_IMPORT_PATH, rawMessage);
  }

  updatedTheNameSamePath(name: string, updatedName: string) {
    console.log(
      `${blue('UPDATED')} the domain name from "${bold(name)}" to "${underline(
        bold(blue(updatedName)),
      )}". Hash does not match because the name is different`,
    );
    const rawMessage = `UPDATED the domain name from "${name}" to "${updatedName}". Hash does not match because the name is different\n`;
    this.systemService.writeInTheFile(NODE_IMPORT_PATH, rawMessage);
  }

  updatedNode(name: string) {
    console.log(`${blue('UPDATED')} the node with name of "${bold(blue(name))}"`);
    const rawMessage = `UPDATED the node with name of "${name}\n`;
    this.systemService.writeInTheFile(NODE_IMPORT_PATH, rawMessage);
  }

  deletedNode(name: string) {
    console.log(
      `${red('DELETED')} the "${underline(
        bold(red(name)),
      )}" node. Hash or name does not match.The domain might be hanging from another topics`,
    );
    const rawMessage = `DELETED the "${name}" node. Hash or name does not match.The domain might be hanging from another topics\n`;
    this.systemService.writeInTheFile(NODE_IMPORT_PATH, rawMessage);
  }

  definitiveDeleteNode(name: string, hash: string) {
    console.log(
      `${red('DELETED')} the "${underline(
        bold(red(`${name} - ${hash}`)),
      )}" node. The domain is not included in bookmarks folder for different reasons`,
    );
    const rawMessage = `DELETED the "${name} - ${hash}" node. The domain is not included in bookmarks folder for different reasons\n`;
    this.systemService.writeInTheFile(NODE_IMPORT_PATH, rawMessage);
  }

  /********* 3.DELETE THE NODES WITH 0 DEPTH **************/
  notChildTopicDeleted(name: string, hash: string) {
    console.log(
      `${red('DELETED')} the "${underline(bold(red(`${name} - ${hash}`)))}" topic because it did not have any children`,
    );
    const rawMessage = `DELETED the "${name} - ${hash}" topic because it did not have any children\n`;
    this.systemService.writeInTheFile(DOMAIN_DELETED_PATH, rawMessage);
  }

  /********* 4.DELETE THE UNAVAILABLE NODES **************/
  printOutput({ message, color }: IPrintOut) {
    console.log(color(message));
    this.systemService.writeInTheFile(DOMAIN_UNAVAILABLE_PATH, message + '\n');
  }
}
