import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomConfigOptions } from './interfaces';
import { CONFIG_PROVIDER_VALUE_NAME } from './constants';
import { EnvConfigService } from './env.config.service';

export class EnvConfigModule {
  /**
   * Create an static function to call directly from the class without instantiation
   * @param options: Our config module attributes or properties
   * @returns DynamicModule
   */
  static register(options: CustomConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_PROVIDER_VALUE_NAME,
          useValue: options,
        },
        EnvConfigService,
      ],
      exports: [EnvConfigService],
    };
  }
}
