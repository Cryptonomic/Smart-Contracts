const getSwaps = async (store) => {
  const swaps = await store.contract.methods.getAllSwaps().call();
  return swaps;
};

export default getSwaps;
