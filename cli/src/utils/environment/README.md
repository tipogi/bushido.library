### Environments

Custom environment module to get the configuration files from `.yml` files. 
Each environment will have its own .yml file. Usually, we will have *dev*, *staging* and *production* environments

To compile also the yml files and add in the `build` folder, we have to add this snippet in the nest-cli.json file:
```json
"compilerOptions": {
    "assets": ["config/environment/*.yml"]
  }
```