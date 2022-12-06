# bushido.library

This is a CLI application to feed domains into a graph database as Neo4J. Once the import finish, we have an endpoint consume that information to after render it for example in a web page

## Overview

![Library Architecture](./docs/assets/arch.png)

The user interacts with CLI sending different commands to populate, update or health-check the domain library (graph db). There are two main parts in the application which are structured in different folders:
- __bookmarks__: All the domains that we want to add in our library and it follows, the tree data structure.
- __cli__: console server to interact with the database to save/delete domains. More info in [cli](./cli/README.md)