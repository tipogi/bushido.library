import { Injectable } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';
import { FileGeneratorService } from './FileGenerator.service';

@Injectable()
export class CLIService {
  constructor(private readonly consoleService: ConsoleService, private readonly fileGenerator: FileGeneratorService) {
    // get the root cli
    const cli = this.consoleService.getCli();

    // create a single command (See [npm commander arguments/options for more details])
    this.consoleService.createCommand(
      {
        command: 'generate',
        description: 'description',
      },
      this.generateFiles,
      cli, // attach the command to the cli
    );
  }

  generateFiles = async (): Promise<void> => {
    console.log(`Generating the JSON files to export in the Graph Database`);
    await this.fileGenerator.generateFiles();
    console.log('finished!!');
  };
}
