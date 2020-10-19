const store = require("./store");

module.exports = async (web3, address) => {
  const balance = await web3.eth.getBalance(address); //Will give value in.
  return balance;
};
