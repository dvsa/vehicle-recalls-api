exports.load = () => ({
  isDebug: (() => {
    return process.env.SMMT_API_URI;
  })(),
  smmtApiKey: process.env.SMMT_API_KEY,
});
