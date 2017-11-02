module.exports = serviceConfig => (tokens, req, res) => JSON.stringify({
  component: serviceConfig.name,
  env: serviceConfig.env,
  level: 'INFO',
  message: 'Received request.',
  timestamp: new Date().getTime(),
  context: {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTimeInMs: tokens['response-time'](req, res),
  },
});
