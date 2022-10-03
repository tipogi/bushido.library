import neo4j, { Driver } from 'neo4j-driver';
import { Neo4jConfig } from './interfaces/neo4j-config.interface';
import { blue, red } from 'colors';

const NEO4J_CONNECT_TIMEOUT = 1000;

/**
 * Open a connection with the Neo4j database and get the driver to open session against it
 * @param config
 * @returns Driver
 */
export const createDriver = async (config: Neo4jConfig): Promise<Driver> => {
  console.log(blue('[NEO4J] Open neo4J database connection throw the driver...'));
  const driver = neo4j.driver(
    `${config.scheme}://${config.host}:${config.port}`,
    neo4j.auth.basic(config.username, config.password),
  );
  let connected = false;
  while (!connected) {
    console.log(blue(`[NEO4J] Connection ping to neo4J database will start in ${NEO4J_CONNECT_TIMEOUT}ms...`));
    connected = await pingToDatabase(driver);
  }
  return driver;
};

/**
 * Before expand all the backend functionality, the backend has to connect to the database
 * @param driver
 * @returns: If connection is successful or not
 */
const pingToDatabase = async (driver: Driver): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const res = await driver.verifyConnectivity();
        if (typeof res.address === 'string' && typeof res.version === 'string') {
          console.log(blue('[NEO4J] The database connection open successfully, ready bootstrap the backend server...'));
          resolve(true);
        }
      } catch (e) {
        console.log(
          red('[NEO4J_ERROR]\tDatabase ping failed, could not perform discovery. No routing servers available!'),
        );
        resolve(false);
      }
    }, NEO4J_CONNECT_TIMEOUT);
  });
};
