const config = require("../../config/eth-config.json");
const BCInteract = require("../bc-intereraction");
const initAdminAccount = require("../init");

const toggleContractState = async (state) => {
  const web3 = initAdminAccount();
  var contractinstance = new web3.eth.Contract(config.abi, config.contractAddr);
  const data = await contractinstance.methods
    .toggleContractState(state)
    .encodeABI();
  const rc = await BCInteract(
    web3,
    data,
    "0",
    "1000000",
    config.contractAddr,
    config.chain
  );
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

toggleContractState(true);
