import invokeContract from "./util/invokeContract";

const redeem = async (store, hashedSecret, secret) => {
  const res = await invokeContract(
    store,
    0,
    "redeem",
    `(Pair ${hashedSecret} ${secret})`,
    100000,
    300
  );
  if (res.status !== "applied") {
    return false;
  }
  return true;
};

export default redeem;
