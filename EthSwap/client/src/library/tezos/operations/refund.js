import invokeContract from "./util/invokeContract";

const refund = async (store, hashedSecret) => {
  const res = await invokeContract(
    store,
    0,
    "refund",
    `${hashedSecret}`,
    100000
  );
  if (res.status !== "applied") {
    return false;
  }
  return true;
};

export default refund;
