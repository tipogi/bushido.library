`npm install -g typescript ts-node`
compiler init
`tsc --init`

edit in tsconfig.json to `rootDir` and `outDir`
init package modlue
`npm --init`
Install concurrently
`npm install --save-dev concurrenctly`

add scripts commands in package.json
```json
"scripts": {
  "start:build": "tsc -w",
  "start:run": "nodemon dist/index.js",
  "start": "concurrently npm:start:*"
}
```

run `npm start`

CardTypes: Root, Branch, Leaf
Leaf card types contains all the related Domains

We have two type of nodes:
  - Branch: The node type which have more nodes, could be branch type or Leaf type
  - Leaf: The last element of the graph before we get the domains. The domains are hanging from that node type, lets just say are the children

We have two card types:
  - Topic: As the name say it describes a topic for the domains
  - Domain: All the links related to one topic