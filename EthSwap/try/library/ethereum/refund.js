const store = require("./store");
const BCInteract = require("./bc-intereraction");

module.exports = async (web3, secret) => {
  const data = await store.contract.methods.refund(secret).encodeABI();
  const rc = await BCInteract(web3, data, "0", "1000000");
  if (rc) {
    console.log("REFUND SUCCESFULLY");
  } else {
    console.log("ERROR REFUNDING");
  }
  return;
};

// refund("0x055e1d97b8f4a2d0e8913e6300818ed3c235f886d3b71bdfde7ed5aa05d724fd");
