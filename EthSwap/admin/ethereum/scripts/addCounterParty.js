const config = require("../../config/eth-config.json");
const BCInteract = require("../bc-intereraction");
const initAdminAccount = require("../init");

const Test = async (secret, ethAccount) => {
  const web3 = initAdminAccount();
  var contractinstance = new web3.eth.Contract(config.abi, config.contractAddr);
  const data = await contractinstance.methods
    .addCounterParty(secret, ethAccount)
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
  "0xa881ec2b066a70d6265dabd60d1ef5f6bae725ac9e9846e43b91a48db4addcd4",
  "0x91f79893E7B923410Ef1aEba6a67c6fab07D800C"
);
