const Web3 = require("web3");
const config = require("../config/eth-config.json");

//Infura HttpProvider Endpoint
module.exports = () => {
  const web3 = new Web3(new Web3.providers.HttpProvider(config.RPC));
  web3.eth.defaultAccount = config.walletAddress;
  return web3;
};
