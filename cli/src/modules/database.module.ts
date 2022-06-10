import { Module } from '@nestjs/common';
import {
  CONFIG_FILE_PATH,
  DDBB_HOST,
  DDBB_NAME,
  DDBB_PASSWORD,
  DDBB_PORT,
  DDBB_SCHEME,
  DDBB_USERNAME,
} from 'src/utils/environment/constants';
import { EnvConfigModule } from 'src/utils/environment/env.config.module';
import { EnvConfigService } from 'src/utils/environment/env.config.service';
import { Neo4jConfig, Neo4jModule } from 'src/utils/neo4j';

@Module({
  imports: [
    Neo4jModule.forRootAsync({
      imports: [
        EnvConfigModule.register({
          folder: CONFIG_FILE_PATH,
        }),
      ],
      inject: [EnvConfigService],
      useFactory: (configService: EnvConfigService): Neo4jConfig => {
        return {
          scheme: configService.get(DDBB_SCHEME),
          host: configService.get(DDBB_HOST),
          port: configService.get(DDBB_PORT),
          username: configService.get(DDBB_USERNAME),
          password: configService.get(DDBB_PASSWORD),
          database: configService.get(DDBB_NAME),
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}
