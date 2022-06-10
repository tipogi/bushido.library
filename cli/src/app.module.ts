import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { CLIService } from './services/cli.service';
import { DatabaseModule } from './modules/database.module';
import { FileGeneratorService } from './services/FileGenerator.service';

@Module({
  imports: [/*DatabaseModule, */ConsoleModule],
  controllers: [],
  providers: [CLIService, FileGeneratorService],
})
export class AppModule {}
