const config = require("../../config/eth-config.json");
const BCInteract = require("../bc-intereraction");
const initAdminAccount = require("../init");

const Test = async (secret, refundTime, tezAcc, amtInEther) => {
  const web3 = initAdminAccount();
  var contractinstance = new web3.eth.Contract(config.abi, config.contractAddr);
  const data = await contractinstance.methods
    .initiateWait(secret, tezAcc, refundTime)
    .encodeABI();
  const rc = await BCInteract(
    web3,
    data,
    amtInEther,
    "1000000",
    config.contractAddr,
    config.chain
  );
  console.log("SUCCESS : ", rc);
};

//Tezos Addr to transfer the converted crypto and amount to convert in Eth
Test(
  "0xa881ec2b066a70d6265dabd60d1ef5f6bae725ac9e9846e43b91a48db4addcd5",
  Math.trunc(Date.now() / 1000) + 3600,
  "tz1TjCVuTLE7mHRJdS8GDYhtmjTu1eAncq8e",
  "0.04"
);
