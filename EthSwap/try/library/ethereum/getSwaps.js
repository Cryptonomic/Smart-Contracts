const config = require("../../globalConfig.json");
const store = require("./store");

module.exports = async () => {
  const swaps = await store.contract.methods.getAllSwaps().call();
  return swaps;
};

// getAllSwaps().then((res) => console.log(res));
