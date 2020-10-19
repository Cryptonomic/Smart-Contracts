const config = require("../../config/eth-config.json");
const BCInteract = require("../bc-intereraction");
const initAdminAccount = require("../init");

const refund = async (secret, web3) => {
  var contractinstance = new web3.eth.Contract(config.abi, config.contractAddr);
  const data = await contractinstance.methods.refund(secret).encodeABI();
  const rc = await BCInteract(
    web3,
    data,
    "0",
    "1000000",
    config.contractAddr,
    config.chain
  );
  if (rc) {
    console.log("REFUND SUCCESFULLY");
  } else {
    console.log("ERROR REFUNDING");
  }
  return;
};

const getAllSwaps = async (web3) => {
  const contractinstance = new web3.eth.Contract(
    config.abi,
    config.contractAddr
  );
  const swaps = await contractinstance.methods.getAllSwaps().call();
  return swaps;
};

const refundAll = async () => {
  const web3 = initAdminAccount();
  const swaps = await getAllSwaps(web3);
  for (let i = 0; i < swaps.length; i++) {
    if (Math.trunc(Date.now() / 1000) >= swaps[i].refundTimestamp)
      await refund(swaps[i].hashedSecret, web3);
  }
};

refundAll();
