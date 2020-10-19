const store = require("./store");

module.exports = async (secretHash) => {
  const data = await store.contract.getPastEvents("Redeemed", {
    filter: { _hashedSecret: secretHash },
    fromBlock: 0,
    toBlock: "latest",
  });
  return data[0].returnValues["_secret"];
};

// getReedemedSwap(
//   "0x055e1d97b8f4a2d0e8913e6300818ed3c235f886d3b71bdfde7ed5aa05d724fd"
// ).then((res) => console.log(res[0].returnValues["_secret"]));
