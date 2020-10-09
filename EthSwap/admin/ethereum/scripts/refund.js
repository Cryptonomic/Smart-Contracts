const config = require("../../config/eth-config.json");
const BCInteract = require("../bc-intereraction");
const initAdminAccount = require("../init");

const refund = async (secret) => {
  const web3 = initAdminAccount();
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

refund("0xc43f27559058c3d3427dfd13106a52815822b022aad70b8fb21824e0888f8665");
