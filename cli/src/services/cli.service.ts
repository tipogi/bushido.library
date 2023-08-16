import { Injectable } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';
import { ClearDBService } from './clear.db.service';
import { FileGeneratorService } from './file.generator.service';
import { PopulateDBService } from './populate.db.service';
import { TopicFile } from 'src/classes/import';

@Injectable()
export class CLIService {
  constructor(
    private readonly consoleService: ConsoleService,
    private readonly fileGenerator: FileGeneratorService,
    private readonly populateDBService: PopulateDBService,
    private readonly clearDBService: ClearDBService,
  ) {
    // Get the root cli
    const cli = this.consoleService.getCli();

    // Create a generate command
    this.consoleService.createCommand(
      {
        command: 'generate',
        description: 'Updated the bookmark folder, run this command to create the import files: topic.json, domain.json',
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

    this.consoleService.createCommand(
      {
        command: 'optimise-graph',
        description: 'Once we update/create/delete all the domain nodes, it might be some topics without children',
      },
      this.clearGraph,
      cli,
    );

    this.consoleService.createCommand(
      {
        command: 'domain-url-check',
        description:
          'Check which URLs are healthy (200) and the ones that are not available (404) mark it before delete the domain',
      },
      this.clearUrls,
      cli,
    );
  }

  generateFiles = async (): Promise<void> => {
    console.log(`Generating the JSON files to export in the Graph Database`);
    const topicJSON = await this.fileGenerator.generateFiles();
    // Make sure all the LEAF nodes still have that type. In some cases, some LEAF node types
    // can expand to BRANCH type, it gets duplicated as new node and it might bring some 
    // broken links in the graph.
    // For that compare the graph database and the topic structures
    const evolvedNodes = await this.clearDBService.analyseTopicHash(topicJSON);
    if (evolvedNodes === 0) {
      console.log('There is not any node that evolved to BRANCH type. The new JSON files creationfinished!');
    }
  };

  importTopicJSON = async (): Promise<void> => {
    console.log('Importing topics to Database');
    await this.populateDBService.withTopics();
  };
  importDomainJSON = async (): Promise<void> => {
    console.log('Importing domains to Database');
    await this.populateDBService.withDomains();
  };

  clearGraph = async (): Promise<void> => {
    console.log('Deleting Topics without children...');
    await this.clearDBService.deleteTopicsWithoutChildren();
  };

  clearUrls = async (): Promise<void> => {
    console.log('Clear the unavailable URLs...');
    await this.clearDBService.checkDomainUrls();
  };
}
