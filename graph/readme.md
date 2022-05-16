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

Folder -> cards
CardTypes: Root, Branch, Leaf
Leaf card types contains all the related Domains