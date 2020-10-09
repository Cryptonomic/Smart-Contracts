import BCInteract from "./bc-intereraction";

const refund = async (web3, store, secret) => {
  const data = await store.contract.methods.refund(secret).encodeABI();
  const rc = await BCInteract(web3, store, data, "0", "1000000");
  return rc;
};

export default refund;
