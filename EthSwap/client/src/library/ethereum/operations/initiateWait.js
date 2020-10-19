import BCInteract from "./bc-intereraction";

const initWait = async (
  web3,
  store,
  secret,
  refundTime,
  tezAcc,
  amtInEther
) => {
  const data = await store.contract.methods
    .initiateWait(secret, tezAcc, refundTime)
    .encodeABI();
  const rc = await BCInteract(web3, store, data, amtInEther, "1000000");
  return rc;
};

export default initWait;
