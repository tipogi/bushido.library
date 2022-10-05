export const LEAF_WITHOUT_CHILD = `
  MATCH (leaf:Leaf)
  WHERE NOT (leaf)-[:HAS]->()
  WITH leaf, leaf.name as name, leaf.hash as hash
  DETACH DELETE leaf
  RETURN name, hash
`;

export const BRANCH_WITHOUT_CHILD = `
  MATCH (branch:Branch)
  WHERE NOT (branch)-[:HAS]->()
  WITH branch, branch.name as name, branch.hash as hash
  DETACH DELETE branch
  RETURN name, hash
`;
