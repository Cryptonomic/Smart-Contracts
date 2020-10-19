import invokeContract from "./util/invokeContract";

const initWait = async (store, ethAddress, amtMuTez, hashedSecret, time) => {
  const res = await invokeContract(
    store,
    amtMuTez,
    "initiateWait",
    `(Pair ${hashedSecret} (Pair "${time}" "${ethAddress}"))`,
    10000,
    300
  );
  if (res.status !== "applied") {
    return false;
  }
  return true;
};

export default initWait;
