export const GET_DOMAINS = `
  MATCH (d:Domain)
  RETURN { hash: d.hash, url: d.url, name: d.name, views: d.visits} as domain
`;
