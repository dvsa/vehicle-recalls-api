# Software Development Quality Assurance Policy

### JavaScript code style
##
Code must be written according to [JavaScript Style Guide](https://github.com/airbnb/javascript)
To avoid any mistakes please use esLint with airbnb config.
##
Example package.json config file is located in Fake SMMT service repository, in app folder.

##
### Software development quality
##
To reduce chance of delivering software with major bugs and to be able to verify created software on early stage, all developed features must be covered by unit test and integration tests.
##
Default unit tests execution engine is [Mocha](https://mochajs.org/) supported by [Chai](http://chaijs.com/) and by [Chai-Http](https://github.com/chaijs/chai-http).
##
Unit and integration tests coverage is calculated by [Istanbul](https://istanbul.js.org/).
Minimal coverage must be above 90%. You can easily check current coverage by executing:
```
npm test
```
Last section provide details related with tests coverage.

To generate user friendly, html report, use command (after executing tests):
```
npm run report
open coverage/index.html
```
It will generate HTML report with details which lines or functions are not covered by tests.

##
### Basic security policy
##

To reduce the risk of delivering product containing security issues all node libraries must be checked by [Retire.js](https://retirejs.github.io/retire.js/)
It will verify if used libraries contain known vulnerabilities.

To verify libraries use command:
```
npm run retire
```
