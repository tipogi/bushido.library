import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { CLIService } from './services/cli.service';
import { DatabaseModule } from './modules/database.module';
import { FileGeneratorService } from './services/file.generator.service';
import { PopulateDBService } from './services/populate.db.service';

@Module({
  imports: [/*DatabaseModule, */ConsoleModule],
  controllers: [],
  providers: [CLIService, FileGeneratorService, PopulateDBService],
})
export class AppModule {}
