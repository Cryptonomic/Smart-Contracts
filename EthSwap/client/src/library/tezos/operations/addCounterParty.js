import invokeContract from "./util/invokeContract";

const addCounterParty = async (store, tezAccount, hashedSecret) => {
  const res = await invokeContract(
    store,
    0,
    "addCounterParty",
    `(Pair ${hashedSecret} "${tezAccount}")`,
    100000
  );
  if (res.status !== "applied") {
    return false;
  }
  return true;
};

export default addCounterParty;
