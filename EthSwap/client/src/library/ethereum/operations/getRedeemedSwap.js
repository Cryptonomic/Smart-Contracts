const getRedeemedSecret = async (store, secretHash) => {
  const data = await store.contract.getPastEvents("Redeemed", {
    filter: { _hashedSecret: secretHash },
    fromBlock: 0,
    toBlock: "latest",
  });
  return data[0].returnValues["_secret"];
};

export default getRedeemedSecret;
