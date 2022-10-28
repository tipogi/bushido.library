import { Inject, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { exit } from 'process';
import { get } from 'lodash';
import { CustomConfigOptions, EnvironmentConfigParams } from './interfaces';
import { CONFIG_PROVIDER_VALUE_NAME } from './constants';
// Read the .env file that it is located in the root folder
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Injectable()
export class EnvConfigService {
  // The attributes that stores our configuration properties
  private readonly envConfig: EnvironmentConfigParams;
  // Inject the arguments received from the module
  constructor(@Inject(CONFIG_PROVIDER_VALUE_NAME) private options: CustomConfigOptions) {
    try {
      const environment = process.env.APP_ENV || 'development';
      console.log(`Application running in ${environment} environment`);
      const envFile = path.resolve(__dirname, '../../', this.options.folder, `${environment}.yml`);
      this.envConfig = yaml.load(readFileSync(envFile), 'utf8');
    } catch (e) {
      console.log(
        'The requested environment file does not exist. Add the yml file in config/environment folder. Or it could be another mayor error. Or YML is not well formatted. Check the file',
      );
      exit(1);
    }
  }
  /**
   * Get our configuration value
   * @param keyword: The path of the configuration value
   */
  get(keyword: string) {
    return get(this.envConfig, keyword);
  }
}
