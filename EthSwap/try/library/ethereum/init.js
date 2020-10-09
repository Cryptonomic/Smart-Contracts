const Web3 = require("web3");
const store = require("./store");
const config = require("../../globalConfig.json");

//Infura HttpProvider Endpoint
module.exports = (rpc, key) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
  store.keyStore = web3.eth.accounts.privateKeyToAccount(key);
  store.keyStore.privateKey = store.keyStore.privateKey.substring(2);
  store.contract = new web3.eth.Contract(
    config.ethereum.abi,
    config.ethereum.contractAddr
  );
  return web3;
};
