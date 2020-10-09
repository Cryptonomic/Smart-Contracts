import BCInteract from "./bc-intereraction";

const addCoutnerParty = async (web3, store, secret, ethAccount) => {
  const data = await store.contract.methods
    .addCounterParty(secret, ethAccount)
    .encodeABI();
  const rc = await BCInteract(web3, store, data, "0", "1000000");
  return rc;
};

export default addCoutnerParty;
