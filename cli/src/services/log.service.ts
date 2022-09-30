import { Injectable } from '@nestjs/common';
import { blue, bold, green, red, underline } from 'colors';

@Injectable()
export class LogService {
  topicAdded(name: string) {
    console.log(`${green('CREATED')} the topic ${bold(green(name))}, added in the graph`);
  }

  domainAdded(name: string) {
    console.log(`${green('CREATED')} the domain ${bold(green(name))}, added in the graph`);
  }

  updatedTheNameSamePath(name: string, updatedName: string) {
    console.log(
      `${blue('UPDATED')} the domain name from "${bold(name)}" to "${underline(
        bold(blue(updatedName)),
      )}". Hash does not match because the name is different`,
    );
  }

  updatedNode(name: string) {
    console.log(`${blue('UPDATED')} the node with name of "${bold(blue(name))}"`);
  }

  deletedNode(name: string) {
    console.log(
      `${red('DELETED')} the "${underline(
        bold(red(name)),
      )}" node. Hash or name does not match.The domain might be hanging from another topics`,
    );
  }

  definitiveDeleteNode(name: string, hash: string) {
    console.log(
      `${red('DELETED')} the "${underline(
        bold(red(`${name} - ${hash}`)),
      )}" node. The domain is not included in bookmarks folder for different reasons`,
    );
  }
}
