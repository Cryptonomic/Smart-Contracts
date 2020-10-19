const config = require("../../config/eth-config.json");
const BCInteract = require("./bc-intereraction");
const initAdminAccount = require("./init");

module.exports = async () => {
  const web3 = initAdminAccount();
  var contractinstance = new web3.eth.Contract(config.abi);
  const data = contractinstance
    .deploy({
      data: config.byteCode,
      arguments: [],
    })
    .encodeABI();
  const rc = await BCInteract(web3, data, "0", "5000000", "", config.chain);
  console.log("CONTRACT ADDR : ", rc);
};
