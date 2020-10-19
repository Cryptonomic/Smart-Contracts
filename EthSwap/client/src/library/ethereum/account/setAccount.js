import Web3 from "web3";
import config from "../../../globalConfig.json";

const setEthAccount = (key) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.RPC));
  const keyStore = web3.eth.accounts.privateKeyToAccount(key);
  keyStore.privateKey = keyStore.privateKey.substring(2);
  const contract = new web3.eth.Contract(
    config.ethereum.abi,
    config.ethereum.contractAddr
  );
  return { web3, keyStore, contract };
};

export default setEthAccount;
