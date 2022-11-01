# debugging node.js with typescript and docker

let's start with a blank directory first

```js
yarn init -y
```

```js
npx gitignore node
```

```js
yarn add -D @types/node @types/express typescript
yarn add express
```

add tsconfig.json file to the root of the project

```js
{
  "compilerOptions": {
    "target": "es5",
    "strict": true,
    "esModuleInterop": true,
    "composite": true,
    "baseUrl": ".",
    "paths":{
      "@lib1": ["./lib1"]
    }
  }
}
```

```js
yarn add -D nodemon prettier ts-node tsconfig-paths
```

add .prettierrc

```js
{}
```

add script to package.json

```js
  "scripts": {
    "dev": "docker-compose -f docker-compose.yml up --build"
  },
```

add a few extras to package.json

```js
  "nodemonConfig": {
    "watch": [
      "app1.ts",
      "app2.ts",
      "lib1.ts"
    ],
    "ext": "ts",
    "ignore": [
      ".git",
      "node_modules/**/node_modules"
    ],
    "execMap": {
      "ts": "node --require ts-node/register -r tsconfig-paths/register"
    }
  }
```

now create our app1.ts

```js
import express from "express";

const app1 = express();

app1.get("*", (req, res) => {
  const span = `<span style="text-decoration: underline;">app1</span>`;
  const heading = `<h1>This is a ${span}</h1>`;
  res.send(heading);
});

app1.listen(3000, () => {
  console.info("app1 is listening on port 3000");
});

```

add docker-compose.yml

```js
version: "3.8"
services:
  app1:
    image: node:16
    volumes:
      - ./node_modules:/node_modules
      - ./package.json:/package.json
      - ./tsconfig.json:/tsconfig.json
      - ./app1.ts:/app1.ts
    ports:
      - 3000:3000
    command: yarn ts-node app1.ts
```


to test everything out run

```js
docker-compose up --build
```

this will download the node:16 image if you have not used it before and now you should see your new image. You could also run docker-compose up -d to run in detached mode. To stop, run docker-compose down and it will shut down your container.

now you can browse to localhost:3000 and you should see your shiny new app

now change up the docker-compose file

```js
  ports:
    - 9229:9229
command: yarn nodemon --inspect=0.0.0.0:9229 app1.ts
```

now we will have hot-reloading on our server

for the vscode debugger, we will use this code

```js
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "app1",
      "type": "node",
      "request": "attach",
      "port":9229,
      "restart":true,
      "localRoot":"${workspaceFolder}",
      "remoteRoot": "/"
    }
  ]
}
```

now if you run

```js
docker-compose -f docker-compose.yml up --build
```

now you can launch the debugger, add breakpoints and you should be good to go


now let's create another app, app2.ts. it will look the same

```js
import express from "express";

const app1 = express();

app1.get("*", (req, res) => {
  const span = `<span style="text-decoration: underline;">app2</span>`;
  const heading = `<h1>This is a ${span}</h1>`;
  res.send(heading);
});

app1.listen(3000, () => {
  console.info("app2 is listening on port 3000");
});

```

now update the docker-compose file

```js
version: '3'
services:
  app1:
    image: node:14
    volumes:
      - ./node_modules:/node_modules
      - ./package.json:/package.json
      - ./tsconfig.json:/tsconfig.json
      - ./app1.ts:/app1.ts
      - ./lib1.ts:/lib1.ts
    ports:
      - 3000:3000
      - 9229:9229
    command: yarn nodemon --signal SIGINT --inspect=0.0.0.0:9229 --nolazy app1.ts

  app2:
    image: node:14
    volumes:
        - ./node_modules:/node_modules
        - ./package.json:/package.json
        - ./tsconfig.json:/tsconfig.json
        - ./app2.ts:/app2.ts
        - ./lib1.ts:/lib1.ts
    ports:
      - 3001:3000
      - 9230:9229
    command: yarn nodemon --signal SIGINT --inspect=0.0.0.0:9229 --nolazy app2.ts
```

now they should both be able to start up

now update our launch configuration

```js
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "app1",
      "type": "node",
      "request": "attach",
      "port":9229,
      "restart":true,
      "localRoot":"${workspaceFolder}",
      "remoteRoot": "/"
    },
    {
      "name": "app2",
      "type": "node",
      "request": "attach",
      "port":9230,
      "restart":true,
      "localRoot":"${workspaceFolder}",
      "remoteRoot": "/"
    }
  ]
}
```


