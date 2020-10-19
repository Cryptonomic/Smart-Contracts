const config = require("../../config/eth-config.json");
const initAdminAccount = require("../init");

const getSwap = async (secretHash) => {
  const web3 = initAdminAccount();
  const contractinstance = new web3.eth.Contract(
    config.abi,
    config.contractAddr
  );
  const swaps = await contractinstance.methods.swaps(secretHash).call();
  return swaps;
};

getSwap(
  "0x33db7a492a6440e26bf41a034c7872214a17c5f8516cfaaeaee90f9a5cd907b5"
).then((res) => console.log(res));
