# Bushido CLI
Extract from **bookmarks** folder all the information(JSON) and then import in the graph database that nodes. With that process we are going to feed bushido.guide cards
### Description
Read the **bookmarks** folder and create objets to generate the JSON files (*cli/export*). The application creates two type of objects to generate the database nodes:
- BRANCH: Generic nodes which can have as a children, a *branch* or a *leaf*. This type of objects will never have *domains*
- LEAF: The last node before access to the domains. It will contain all the *domains* of that topic.

Once we generate all the objects from the bookmarks folder, the next step is to create the export files for the database:
- topic.json: All the node types that has a children. It could be another topic as `wallet` or it has `domains`. In that case, that nodes just describe the path to reach that domains
- domain.json: The leaf elements of our database, it is the URL that we get when we are inside of one topic. 
Finally, export all the files in the database
### Commands
Before run the commands the project has to be compiled from TypeScript to JavaScript, execute:
```bash
npm run build
```
Once the compilation finish, we are ready to run our commands:
Create the `topic.json` and `domain.json` files from the *bookmarks* folder:
```bash
npm run bushido-cli generate
```
If the command is succesful, import the file as nodes in the graph database:
```
npm run bushido-cli import
```