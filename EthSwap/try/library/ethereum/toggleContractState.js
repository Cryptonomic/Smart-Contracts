const BCInteract = require("./bc-intereraction");
const store = require("./store");

module.exports = async (web3, state) => {
  const data = await store.contract.methods
    .toggleContractState(state)
    .encodeABI();
  const rc = await BCInteract(web3, data, "0", "1000000");
  if (rc) {
    const data = await contractinstance.methods.active().call();
    console.log(`CONTRACT STATE ${data}`);
  } else {
    console.log("ERROR UPDATING CONTRACT STATE");
  }
  return;
};

// true -> active
// false -> deactivated

// toggleContractState(true);
