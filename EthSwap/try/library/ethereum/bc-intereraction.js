const config = require("../../globalConfig.json");
const store = require("./store");
const Tx = require("ethereumjs-tx").Transaction;

module.exports = async (
  web3,
  data,
  ether,
  gas,
  to = config.ethereum.contractAddr,
  chain = config.ethereum.chain
) => {
  return new Promise((resolve) => {
    try {
      web3.eth.getBlock("latest", false, (error, result) => {
        var _gasLimit = result.gasLimit;
        try {
          web3.eth.getGasPrice((error, result) => {
            var _gasPrice = result;
            try {
              const privateKey = Buffer.from(store.keyStore.privateKey, "hex");

              var _hex_gasLimit = web3.utils.toHex(
                (_gasLimit + 1000000).toString()
              );
              var _hex_gasPrice = web3.utils.toHex(_gasPrice.toString());
              var _hex_Gas = web3.utils.toHex(gas);

              web3.eth
                .getTransactionCount(store.keyStore.address)
                .then((nonce) => {
                  var _hex_nonce = web3.utils.toHex(nonce);

                  const rawTx = {
                    nonce: _hex_nonce,
                    from: store.keyStore.address,
                    gasPrice: _hex_gasPrice,
                    gasLimit: _hex_gasLimit,
                    gas: _hex_Gas,
                    value: web3.utils.toHex(web3.utils.toWei(ether, "ether")),
                    data: data,
                  };
                  if (to != "") rawTx["to"] = to;
                  const tx = new Tx(rawTx, { chain: chain });
                  tx.sign(privateKey);
                  var serializedTx = "0x" + tx.serialize().toString("hex");
                  web3.eth
                    .sendSignedTransaction(serializedTx.toString("hex"))
                    .on("transactionHash", (transactionHash) => {
                      console.log("ETH TX HASH : ", transactionHash);
                    })
                    .then((contract) => {
                      if (contract.contractAddress != null)
                        resolve(contract.contractAddress);
                      resolve(true);
                    })
                    .catch((error) => {
                      console.error("ETH TX ERROR : ", error);
                      resolve(false);
                    });
                });
            } catch (error) {
              console.error("ETH TX ERROR : ", error);
              resolve(false);
            }
          });
        } catch (error) {
          console.error("ETH TX ERROR : ", error);
          resolve(false);
        }
      });
    } catch (error) {
      console.error("ETH TX ERROR : ", error);
      resolve(false);
    }
  });
};
