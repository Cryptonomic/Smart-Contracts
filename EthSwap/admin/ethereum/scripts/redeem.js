const config = require("../../config/eth-config.json");
const BCInteract = require("../bc-intereraction");
const initAdminAccount = require("../init");

const Test = async (secretHash, secret) => {
  const web3 = initAdminAccount();
  var contractinstance = new web3.eth.Contract(config.abi, config.contractAddr);
  const data = await contractinstance.methods
    .redeem(secretHash, secret)
    .encodeABI();
  const rc = await BCInteract(
    web3,
    data,
    "0",
    "1000000",
    config.contractAddr,
    config.chain
  );
  console.log("SUCCESS : ", rc);
};

//Tezos Addr to transfer the converted crypto and amount to convert in Eth
Test(
  "0x055e1d97b8f4a2d0e8913e6300818ed3c235f886d3b71bdfde7ed5aa05d724fd",
  "0x68656c6c6f666473667364666c64736a666c73646a6664736a6673646a6b666a"
);
