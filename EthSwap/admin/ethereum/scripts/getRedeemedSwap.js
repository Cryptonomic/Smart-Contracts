const config = require("../../config/eth-config.json");
const initAdminAccount = require("../init");

const getReedemedSwap = async (secretHash) => {
  const web3 = initAdminAccount();
  const contractinstance = new web3.eth.Contract(
    config.abi,
    config.contractAddr
  );
  const data = await contractinstance.getPastEvents("Redeemed", {
    filter: { _hashedSecret: secretHash },
    fromBlock: 0,
    toBlock: "latest",
  });
  return data;
};

getReedemedSwap(
  "0xa881ec2b066a70d6265dabd60d1ef5f6bae725ac9e9846e43b91a48db4addcd4"
).then((res) => console.log(res[0].returnValues["_secret"]));
