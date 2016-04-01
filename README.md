# Welcome
This project is meant to serve as a starting point for [Node.js](https://nodejs.org)-based [ExpressJS](http://expressjs.com) & [ES6](https://nodejs.org/en/docs/es6/) projects.

[Mocha](https://mochajs.org) is used for unit-testing our sample application. 

Test coverage reports are generated with [babel-istanbul](https://www.npmjs.com/package/babel-istanbul) - a fork of the popular [Istanbul](https://www.npmjs.com/package/istanbul) code-coverage tool.

Please [create an issue](https://github.com/TheRobBrennan/express_es6_dashboard_starter/issues) if you would like to offer any feedback or suggestions.

## Getting started
This project assumes you are familiar with [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) (node package manager). If these are not installed on your system already, please do so before continuing on.

### Installation
After cloning this repo, you can install all necessary modules with:

    $ npm install

### Unit Tests
The goal of this application is to have 100% test coverage. We are using the popular [Istanbul](https://www.npmjs.com/package/istanbul) code-coverage tool. 

  To run the unit tests for this project and generate a code coverage report:

    $ npm test

  **BONUS**: To verify 100% of your code is covered by testing and that [StandardJS](http://standardjs.com) formatting is present:

    $ npm run test:strict

### Running Your Application
To run the web server:

    $ npm start

To view your sample app, open your web browser and view [http://localhost:3000/](http://localhost:3000/)
