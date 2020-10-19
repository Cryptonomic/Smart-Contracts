const getSwap = async (store, secretHash) => {
  const swap = await store.contract.methods.swaps(secretHash).call();
  return swap;
};

export default getSwap;
