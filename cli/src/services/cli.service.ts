import { Injectable } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';
import { FileGeneratorService } from './file.generator.service';
import { PopulateDBService } from './populate.db.service';

@Injectable()
export class CLIService {
  constructor(
    private readonly consoleService: ConsoleService,
    private readonly fileGenerator: FileGeneratorService,
    private readonly populateDBService: PopulateDBService,
  ) {
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

    // Create a parent command container
    const groupCommand = this.consoleService.createGroupCommand(
      {
        command: 'import',
        description: 'Once we generate the import files, time to populate the database with new domains',
      },
      cli,
    );

    // Create child command of import. We will concatenate that command to import
    this.consoleService.createCommand(
      {
        command: 'topic',
        description: 'Import topic nodes in the database',
      },
      this.importTopicJSON,
      groupCommand,
    );

    // Create child command of import. We will concatenate that command to import
    this.consoleService.createCommand(
      {
        command: 'domain',
        description: 'Import domains (URL) in the database',
      },
      this.importDomainJSON,
      groupCommand,
    );
  }

  generateFiles = async (): Promise<void> => {
    console.log(`Generating the JSON files to export in the Graph Database`);
    await this.fileGenerator.generateFiles();
    console.log('finished!!');
  };

  importTopicJSON = async (): Promise<void> => {
    console.log('Importing topics to Database');
    await this.populateDBService.withTopics();
  };
  importDomainJSON = async (): Promise<void> => {
    console.log('Importing domains to Database');
    await this.populateDBService.withDomains();
  };
}
