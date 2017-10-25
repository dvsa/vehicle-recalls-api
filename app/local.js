const lambda = require('./src/main');

lambda.app.listen(3000, () => {
  console.info('Vehicle recall lambda started in local mode on port 3000.');
});

exports.app = lambda.app;
