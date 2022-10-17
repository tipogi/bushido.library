import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConsoleModule } from 'nestjs-console';
import { CLIService } from './services/cli.service';
import { DatabaseModule } from './modules/database.module';
import { FileGeneratorService } from './services/file.generator.service';
import { PopulateDBService } from './services/populate.db.service';
import { ExtractDBService } from './services/extract.db.service';
import { LogService } from './services/log.service';
import { ClearDBService } from './services/clear.db.service';
import { AxiosService } from './services/axios.service';
import { SystemService } from './services/system.service';

@Module({
  imports: [DatabaseModule, ConsoleModule, HttpModule],
  controllers: [],
  providers: [
    CLIService,
    FileGeneratorService,
    PopulateDBService,
    ExtractDBService,
    LogService,
    ClearDBService,
    AxiosService,
    SystemService,
  ],
})
export class AppModule {}
