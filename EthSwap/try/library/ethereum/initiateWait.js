const store = require("./store");
const BCInteract = require("./bc-intereraction");

module.exports = async (web3, secret, refundTime, tezAcc, amtInEther) => {
  const data = await store.contract.methods
    .initiateWait(secret, tezAcc, refundTime)
    .encodeABI();
  const rc = await BCInteract(web3, data, amtInEther, "1000000");
  console.log("SUCCESS : ", rc);
};

// //Tezos Addr to transfer the converted crypto and amount to convert in Eth
// Test(
//   "0x055e1d97b8f4a2d0e8913e6300818ed3c235f886d3b71bdfde7ed5aa05d724fd",
//   Math.trunc(Date.now() / 1000) + 300,
//   "tz1Y8UNsMSCXyDgma8Ya51eLx8Qu4AoLm8vt",
//   "0.04"
// );
