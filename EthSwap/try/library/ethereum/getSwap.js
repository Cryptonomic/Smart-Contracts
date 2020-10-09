const store = require("./store");

module.exports = async (secretHash) => {
  const swaps = await store.contract.methods.swaps(secretHash).call();
  return swaps;
};

// getSwap(
//   "0x055e1d97b8f4a2d0e8913e6300818ed3c235f886d3b71bdfde7ed5aa05d724fd"
// ).then((res) => console.log(res));
