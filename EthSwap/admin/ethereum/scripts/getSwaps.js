const config = require("../../config/eth-config.json");
const initAdminAccount = require("../init");

const getAllSwaps = async () => {
  const web3 = initAdminAccount();
  const contractinstance = new web3.eth.Contract(
    config.abi,
    config.contractAddr
  );
  const swaps = await contractinstance.methods.getAllSwaps().call();
  return swaps;
};

getAllSwaps().then((res) => console.log(res));
