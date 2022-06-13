import { Injectable } from '@nestjs/common';
import { map, forEach } from 'lodash';
import { File } from 'src/classes/import';
import { CardType, NodeType } from 'src/enumerators';
import { IDomainCard, ITopicCard } from 'src/interfaces';
import { Neo4jService } from 'src/utils/neo4j';

@Injectable()
export class PopulateDBService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async withTopics() {
    const topicFile = new File(NodeType.TOPIC);
    await topicFile.openFile();
    const k = await Promise.all(
      map(topicFile.getNodes(), (node: ITopicCard) => {
        return new Promise(async (resolve) => {
          //console.log(node.type, '->', node.path);
          try {
            let query = '';
            if (node.type === CardType.ROOT) {
              query = CREATE_TOPIC;
            } else {
              const nodeParentPath = createNewPath(node.path);
              query = createInsertTopicQuery(node, nodeParentPath);
            }
            this.neo4jService
              .write(query, {
                name: node.name,
                description: node.description,
                hash: node.nodeHash,
              })
              .then(({ records }) => {
                //console.log(records[0].get('new'));
                resolve('ok');
              });
          } catch (e) {
            console.log(e);
            resolve('fail');
          }
        });
      }),
    );
    console.log(k);
  }

  async withDomains() {
    const topicFile = new File(NodeType.DOMAIN);
    await topicFile.openFile();
    const k = await Promise.all(
      map(topicFile.getNodes(), (node: IDomainCard) => {
        return new Promise(async (resolve) => {
          //console.log(node.type, '->', node.path);
          try {
            const rootPath = createDomainNode(node);
            const query = createInsertTopicQuery2(node, rootPath);
            this.neo4jService
              .write(query, {
                name: node.name,
                description: node.description,
                url: node.url,
              })
              .then(({ records }) => {
                //console.log(records[0].get('new'));
                resolve('ok');
              });
              console.log(query);
          } catch (e) {
            console.log(e);
            resolve('fail');
          }
        });
      }),
    );
    console.log(k);
  }
}



const createDomainNode = (node: IDomainCard) => {
  return extractPath2(node.path);
}

const extractPath2 = (array: string[]) => {
  let restPath = `MATCH (root:Topic:ROOT { name: "${array[0]}"})`;
  const sliced = array.slice(1);
  forEach(sliced, (node, index) => {
    // The last node always has to have parent name.
    // Like this we can identify to add the child
    const nodeName = sliced.length - 1 === index ? 'parent' : `n${index}`;
    restPath += `-[rel${index}:HAS]->(${nodeName}:Topic { name: "${node}"})`;
  });
  return restPath;
};

const createInsertTopicQuery2 = (node: IDomainCard, parentPath: string) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Domain { hash: "${node.hash}"})
    SET new.name=$name, new.description=$description, new.url=$url
    RETURN new`;
};



const createInsertTopicQuery = (node: ITopicCard, parentPath) => {
  return `
    ${parentPath}
    WITH parent
    MERGE (parent)-[childRel:HAS]->(new:Topic:${node.type} { hash: "${node.nodeHash}"})
    SET new.name=$name, new.description=$description, new.hash=$hash
    RETURN new`;
};

const createNewPath = (arrayPath: string[]) => {
  const arrayLength = arrayPath.length;
  const nodeName = arrayLength > 2 ? 'root' : 'parent';
  // cannot be parent if length is longer than 2, it has to be the last element of the loop
  let path = `MATCH (${nodeName}: Topic:ROOT {name: "${arrayPath[0]}"})`;
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
    const nodeName = array.length - 1 === index ? 'parent' : `n${index}`;
    restPath += `-[rel:HAS]->(${nodeName}: Topic { name: "${node}"})`;
  });
  return restPath;
};

const CREATE_TOPIC = `
  MERGE (new: Topic:ROOT { hash: $hash})
  SET new.name = $name, new.description = $description
  RETURN new
`;

const MERGE = `
MERGE (p:Topic {hash: "076c0da81e4f5610554589b38548108f5993eeccd"})
SET p.description = 'Hello', p.name = 'Analizator'
RETURN p`;

const MERGE_REL = `
MATCH (b:Topic { name: "Bitcoin" })-[rel:HAS]->(h:Topic { name: "Hardware"})
WITH h
MERGE (h)-[rel:HAS]->(w:Topic { name: "wallet"})
SET w.hash = "3kd0kc3", w.description = "I am going home"
RETURN w`;
