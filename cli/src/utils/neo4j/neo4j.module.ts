import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Neo4jService } from './neo4j.service';
import { Neo4jConfig } from './interfaces/neo4j-config.interface';
import { NEO4J_OPTIONS, NEO4J_DRIVER } from './neo4j.constants';
import { createDriver } from './neo4j.utils';
import { EnvConfigModule } from '../environment/env.config.module';
import { CONFIG_FILE_PATH } from '../environment/constants';
/*import { Neo4jTransactionInterceptor } from './interceptors/neo4j-transaction.interceptor';
import { Neo4jTypeInterceptor } from './interceptors/neo4j-type.interceptor';*/

@Module({})
export class Neo4jModule {
  static forRoot(config: Neo4jConfig): DynamicModule {
    return {
      module: Neo4jModule,
      global: true,
      providers: [
        {
          provide: NEO4J_OPTIONS,
          useValue: config,
        },
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_OPTIONS],
          useFactory: async (config: Neo4jConfig) => createDriver(config),
        },
        Neo4jService,
      ],
      exports: [Neo4jService],
    };
  }

  // SELECTED OPTION TO CREATE GLOBAL PROVIDER
  // Because we are supplying a custom configuration, which user can create at runtime,
  // we cannot just inject directly, what's called a static module
  // So, in that case, we have to create a function. So we create essentially a static function
  // which then returns a dynamic module
  static forRootAsync(configProvider: any): DynamicModule {
    return {
      module: Neo4jModule,
      global: true,
      imports: [
        EnvConfigModule.register({
          folder: CONFIG_FILE_PATH,
        }),
      ],
      providers: [
        Neo4jService,
        // Create a new provider on the fly
        {
          // Anyone that inject NEO4J_CONFIG, it will have the
          // content of config object
          provide: NEO4J_OPTIONS,
          ...configProvider,
        } as Provider<any>,
        // Add asynchronous provider that verifies if the connection is succcessfull
        {
          // Asynchronous providers are injected to other components by their tokens,
          // like any other provider. In the example above, you would use the
          // construct @Inject('NEO4J_CONFIG').
          provide: NEO4J_DRIVER,
          // If we do not add inject this provider will not have context, it does not know
          // what is Neo4jConfig, so we have to inject
          // And that defines the information that passes throught the function
          // The argument that we provide, it has to be NEO4J_CONFIG
          inject: [NEO4J_OPTIONS],
          useFactory: async (config: Neo4jConfig) => createDriver(config),
        },
      ],
      exports: [Neo4jService],
    };
  }

  static fromEnv(): DynamicModule {
    return {
      module: Neo4jModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        {
          provide: NEO4J_OPTIONS,
          inject: [ConfigService],
          useFactory: (configService: ConfigService): Neo4jConfig => ({
            scheme: configService.get('NEO4J_SCHEME'),
            host: configService.get('NEO4J_HOST'),
            port: configService.get('NEO4J_PORT'),
            username: configService.get('NEO4J_USERNAME'),
            password: configService.get('NEO4J_PASSWORD'),
            database: configService.get('NEO4J_DATABASE'),
          }),
        } as Provider<any>,
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_OPTIONS],
          useFactory: async (config: Neo4jConfig) => createDriver(config),
        },
        Neo4jService,
      ],
      exports: [Neo4jService],
    };
  }
}
