# Node.js REST API example

Node.js REST API boilerplate with Connect, Mongoose, Swagger

> This is the example of the Node.js REST API backend for related [React.js Web](https://github.com/aliaksandr-andreyeu/reactjs-rtk-dashboard) & [React Native Mobile](https://github.com/aliaksandr-andreyeu/react-native-mobx-firebase) applications.

## Configuration

### Set up a MongoDB database:

Set up a MongoDB database either locally or with MongoDB Atlas.

- [MongoDB Atlas](https://mongodb.com/atlas)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Set up environment variables:

Set MongoDB variables in [.env.development](https://github.com/aliaksandr-andreyeu/nodejs-connect-mongoose-swagger/blob/main/src/environments/.env.development):

- `DB_HOST` - Database host name
- `DB_PORT` - Database port number
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PSW` - Database username password

### Project set up:

```bash
npm install

npm run start:dev
```

## Requirements

- `Node.js` >= v16.13.0
- `MongoDB` >= v3.6

## Licensing

Please see our [LICENSE](https://github.com/aliaksandr-andreyeu/nodejs-connect-mongoose-swagger/blob/main/LICENSE) for copyright and license information.
