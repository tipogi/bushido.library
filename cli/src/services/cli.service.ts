import { Injectable } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';
import { FileGeneratorService } from './FileGenerator.service';

@Injectable()
export class CLIService {
  constructor(private readonly consoleService: ConsoleService, private readonly fileGenerator: FileGeneratorService) {
    // Get the root cli
    const cli = this.consoleService.getCli();

    // Create a generate command
    this.consoleService.createCommand(
      {
        command: 'generate',
        description: 'Updated the bookmark folder, run this command to create the import files',
      },
      this.generateFiles,
      cli, // attach the command to the cli
    );

    // Create a generate command
    this.consoleService.createCommand(
      {
        command: 'import',
        description: 'Once we generate the import files, time to populate the database with new domains',
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

  importFiles = async (): Promise<void> => {
    console.log('Importing nodes to Database');
  };
}
