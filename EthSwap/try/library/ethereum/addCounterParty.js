const BCInteract = require("./bc-intereraction");
const store = require("./store");

module.exports = async (web3, secret, ethAccount) => {
  const data = await store.contract.methods
    .addCounterParty(secret, ethAccount)
    .encodeABI();
  const rc = await BCInteract(web3, data, "0", "1000000");
  console.log("SUCCESS : ", rc);
};

// //Tezos Addr to transfer the converted crypto and amount to convert in Eth
// Test(
//   "0x055e1d97b8f4a2d0e8913e6300818ed3c235f886d3b71bdfde7ed5aa05d724fd",
//   "0x97fCF91d8C840E5B44157664082d972eF8542476"
// );
