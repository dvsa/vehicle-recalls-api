# Vehicle recalls api service
Vehicle recalls api service written in Node.js and deployed as a lambda function on AWS.

# [Software Development Quality Assurance Policy](docs/NodejsDevQuality.md)

# [Vehicle recalls service configuration](docs/ServiceConfiguration.md)

# Documentation
### Get vehicle recall

* Endpoint used to verify if vehicle has outstanding recall
```
GET /recalls?make=MakeToCheck&vin=vehicleVinNumber
```

# HTTP response codes:
### 200
* OK -> Outstanding recall
* OK -> No outstanding recall

### 400
* Bad request -> vin or make is not provided

### 403
* SMMT return information that provided VIN is invalid
* SMMT return information that provided MAKE is invalid
* SMMT return unauthorized error (invalid SMMT api key -> env variable: SMMT_API_KEY)

### 500
* Recall service is using incorrect SMMT uri (env variable: SMMT_API_URI)

##
### How to start

* Clone repo
* Go to app folder
* Execute command
```
npm install
```
* Execute command
```
npm start
```

It will start express.js app on localhost port 3000

##
### How to develop

* Download Visual Studio Code
```
brew cask visual-studio-code
```
* Execute command
```
npm install
```
* Start npm watchers in Visual Studio Code terminals
```
npm run test:watch
npm run lint:watch
```

##
### Debug logs
If ``` debug ``` log level is set then additional information will be stored in logs:
* Full request received by service
* Correct SMMT responses received by service

##
### Provided npm commands
* npm start -> It will start web app on localhost:3000 using debug api key and any change will reload server (thx to [nodemon](https://github.com/remy/nodemon))
* npm test -> It will execute unit, integration tests and unit tests code coverage check.
* npm run test:watch -> It starts a file watcher that triggers tests if any of the files have changed
* npm run retire -> It will check libraries for safety
* npm run lint -> It will trigger JavaScript code style check (esLint)
* npm run lint:watch -> It will start file watcher and trigger esLint if any change is detected
* npm run report -> Generate tests coverage report (check app/coverage/index.html for details)
* BUILDSTAMP="BuildNumber" npm run build -> Execute eslint, retire check, tests and create release zip package in app/dist/ folder