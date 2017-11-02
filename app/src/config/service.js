exports.load = () => ({
  isDebug: (() => {
    const debugMode = process.env.RECALL_DEBUG_MODE;
    if (debugMode && debugMode.toUpperCase() === 'TRUE') {
      return true;
    }

    return false;
  })(),
});
