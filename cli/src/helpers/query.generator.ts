import { CardType } from 'src/enumerators';
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

export const createDomainCypherQuery = (node: IDomainCard) => {
  const rootPath = createDomainNode(node.path);
  const query = createInsertTopicQuery2(node, rootPath);
  const data = generateDomainData(node);
  return { query, data };
};

/*******************************/
/*** TOPIC RELATED FUNCTIONS ***/
/*******************************/

const createInsertTopicQuery = (node: ITopicCard, parentPath) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Topic:${upperCaseFirstCharacter(node.type)} { hash: "${node.nodeHash}"})
    SET new.name=$name, new.description=$description, new.hash=$hash, new.icon=$icon
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
  SET new.name = $name, new.description = $description, new.icon=$icon
  RETURN new
`;

const generateTopicData = (node: ITopicCard) => ({
  name: upperCaseJustFirstCharacter(node.name),
  description: node.description,
  hash: node.nodeHash,
  icon: node.icon,
});

/********************************/
/*** DOMAIN RELATED FUNCTIONS ***/
/********************************/

const createDomainNode = (array: string[]) => {
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

const createInsertTopicQuery2 = (node: IDomainCard, parentPath: string) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Domain { hash: "${node.hash}"})
    SET new.name=$name, new.description=$description, new.url=$url, new.icon=$icon, new.lang=$lang, new.tags=$tags
    RETURN new`;
};

const generateDomainData = (node: IDomainCard) => ({
  name: upperCaseJustFirstCharacter(node.name),
  description: node.description,
  url: node.url,
  icon: node.icon,
  lang: node.lang,
  tags: node.tags,
});

/********************************/
/************ OTHERS ************/
/********************************/

const upperCaseFirstCharacter = (word: string) => `${word[0]}${word.slice(1).toLowerCase()}`;
const upperCaseJustFirstCharacter = (word: string) => `${word[0].toUpperCase()}${word.substring(1)}`;
