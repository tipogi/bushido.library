import { CardType } from 'src/constants/enumerators';
import { IDomainCard, ITopicCard } from 'src/interfaces';
import { forEach } from 'lodash';

export const createTopicCypherQuery = (node: ITopicCard) => {
  let query: string;
  if (node.type === CardType.ROOT) {
    const formattedType = upperCaseFirstCharacter(node.type);
    query = createTopic(formattedType);
  } else {
    const nodeParentPath = createNewPath(node.path);
    query = createInsertTopicQuery(node, nodeParentPath);
  }
  const data = generateTopicData(node);
  return { query, data };
};

export const updateByNameCypherQuery = (node: IDomainCard) => {
  const rootPath = createDomainNode(node.path);
  const query = updateCommonProps(node, rootPath);
  const data = generateDomainData(node);
  Object.assign(data, { url: node.url });
  return { query, data };
};

export const updateByUrlCypherQuery = (node: IDomainCard) => {
  const rootPath = createDomainNode(node.path);
  const query = updateDomainByUrl(node, rootPath);
  const data = generateDomainData(node);
  Object.assign(data, { hash: node.hash });
  return { query, data };
};

export const createNewBrandDomainCypherQuery = (node: IDomainCard) => {
  const rootPath = createDomainNode(node.path);
  const data = generateDomainData(node);
  // Add hash property
  Object.assign(data, { hash: node.hash });
  let setClause = DOMAIN_SET_CLAUSE;
  // Add properties in the data object.
  // If previous domain was down, keep the value
  if (node.down_attemps && node.down_attemps !== null) {
    Object.assign(data, { down_attemps: node.down_attemps });
    setClause += ', new.down_attemps=$down_attemps';
  }
  // The previous domain has been visited
  if (node.views && node.views !== null) {
    Object.assign(data, { views: node.views });
    setClause += ', new.views=$views';
  }
  const query = createDomainQuery(rootPath, setClause, node.url);
  return { data, query };
};

/*******************************/
/*** TOPIC RELATED FUNCTIONS ***/
/*******************************/

const SET_CLAUSE = 'SET new.name=$name, new.description=$description, new.hash=$hash, new.icon=$icon';

const createInsertTopicQuery = (node: ITopicCard, parentPath: string) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Topic:${upperCaseFirstCharacter(node.type)} { hash: "${node.nodeHash}"})
    ${SET_CLAUSE}
    RETURN new`;
};

const createNewPath = (arrayPath: string[]) => {
  const arrayLength = arrayPath.length;
  const rootName = upperCaseJustFirstCharacter(arrayPath[0]);
  const nodeName = arrayLength > 2 ? 'root' : 'parent';
  // cannot be parent if length is longer than 2, it has to be the last element of the loop
  let path = `MATCH (${nodeName}: Topic:Root {name: "${rootName}"})`;
  if (arrayLength > 2) {
    path += extractPath(arrayPath.slice(1, arrayLength - 1));
  }
  return path;
};

const extractPath = (array: string[]) => {
  let restPath = '';
  forEach(array, (node, index) => {
    // The last node always has to have parent name.
    // Like this we can identify to add the child
    const nodeNameAttribute = upperCaseJustFirstCharacter(node);
    const nodeName = array.length - 1 === index ? 'parent' : `n${index}`;
    restPath += `-[rel:HAS]->(${nodeName}: Topic { name: "${nodeNameAttribute}"})`;
  });
  return restPath;
};

const createTopic = (nodeType: string) => `
  MERGE (new: Topic:${nodeType} { hash: $hash})
  SET new.name = $name, new.description = $description, new.icon=$icon, new.access=$access
  RETURN new
`;

const generateTopicData = (node: ITopicCard) => ({
  name: upperCaseJustFirstCharacter(node.name),
  description: node.description,
  hash: node.nodeHash,
  icon: node.icon,
  access: node.access,
});

/********************************/
/*** DOMAIN RELATED FUNCTIONS ***/
/********************************/

export const createDomainNode = (array: string[]) => {
  const rootName = upperCaseJustFirstCharacter(array[0]);
  let restPath = `MATCH (root:Topic:Root { name: "${rootName}"})`;
  const sliced = array.slice(1);
  forEach(sliced, (node: string, index: number) => {
    // The last node always has to have parent name.
    // Like this we can identify to add the child
    const nodeNameAttribute = upperCaseJustFirstCharacter(node);
    const nodeName = sliced.length - 1 === index ? 'parent' : `n${index}`;
    restPath += `-[rel${index}:HAS]->(${nodeName}:Topic { name: "${nodeNameAttribute}"})`;
  });
  return restPath;
};

export const GET_DOMAINS = `
  MATCH (d:Domain)
  RETURN { hash: d.hash, url: d.url, name: d.name, views: d.views, path: d.path, down_attemps: d.down_attemps } as domain
`;

export const GET_DOMAINS_BY_URL = `
  MATCH (d:Domain)
  RETURN { hash: d.hash, url: d.url, down_attemps: d.down_attemps } as domain
`;

export const hasURL = (url: string) => `
  WITH parent
  MATCH (parent)-[childRel:HAS]->(node:Domain { url: "${url}"})
  RETURN node
`;

export const DELETE_DOMAIN_BY_HASH = `
  MATCH (d:Domain { hash: $hash})
  DETACH DELETE d
`;

export const editDomainDownAttempsQuery = (hash: string, down_attemps: number) => {
  return `
    MATCH (n:Domain)
    WHERE n.hash = "${hash}"
    SET n.down_attemps = ${down_attemps}
    RETURN n
  `;
};

const updateCommonProps = (node: IDomainCard, parentPath: string) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Domain { hash: "${node.hash}"})
    SET new.name=$name, new.description=$description, new.url=$url, new.icon=$icon, new.lang=$lang, new.tags=$tags
    RETURN new`;
};

const updateDomainByUrl = (node: IDomainCard, parentPath: string) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Domain { url: "${node.url}"})
    SET new.name=$name, new.description=$description, new.hash=$hash, new.icon=$icon, new.lang=$lang, new.tags=$tags
    RETURN new`;
};

const DOMAIN_SET_CLAUSE =
  'SET new.name=$name, new.description=$description, new.hash=$hash, new.icon=$icon, new.lang=$lang, new.tags=$tags';

const createDomainQuery = (parentPath: string, setClause: string, url: string) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Domain { url: "${url}"})
    ${setClause}
    RETURN new`;
};

const generateDomainData = (node: IDomainCard) => ({
  name: upperCaseJustFirstCharacter(node.name),
  description: node.description,
  icon: node.icon,
  lang: node.lang,
  tags: node.tags,
});

/********************************/
/************ OTHERS ************/
/********************************/

const upperCaseFirstCharacter = (word: string) => `${word[0]}${word.slice(1).toLowerCase()}`;
const upperCaseJustFirstCharacter = (word: string) => `${word[0].toUpperCase()}${word.substring(1)}`;
