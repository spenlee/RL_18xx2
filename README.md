NodeJS/Express/MongoDB using Mongo Atlas

# Commands
Installing dependencies, populating node_modules
* yarn install
Compiling
* yarn run build
Starting the server
* yarn run start

# Environment Variables

local .env contains
* DB - mongoDB database connection string with username/password. For example, `DB=dbconnectionstr`

# Tools

* yarn: npm install -g yarn

Adding a dev-dependency, for example
* yarn add @types/express --dev

# Objects

* Persisted Game object with subDocuments. Initially the Game object will contain the live, full gamestate attributes of a given game