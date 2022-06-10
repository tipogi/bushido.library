export interface CustomConfigOptions {
  folder: string;
}

// The private and public keys will be encoded in Base64
export interface EnvironmentConfigParams {
  ddbb: {
    scheme: string;
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
}
