import BCInteract from "./bc-intereraction";

const redeem = async (web3, store, secretHash, secret) => {
  const data = await store.contract.methods
    .redeem(secretHash, secret)
    .encodeABI();
  const rc = await BCInteract(web3, store, data, "0", "1000000");
  return rc;
};

export default redeem;
