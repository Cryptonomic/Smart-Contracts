const invokeContract = require("./util/invokeContract");
const init = require("./init");

// const tezAccount = "tz1TjCVuTLE7mHRJdS8GDYhtmjTu1eAncq8e",
//   secret = "0xecb99bf78f9a21af53b860e5f4dd007555a55f590a93222b58230fc43751c4ea";

module.exports = async (tezAccount, hashedSecret) => {
  const res = await invokeContract(
    0,
    "addCounterParty",
    `(Pair ${hashedSecret} "${tezAccount}")`,
    100000
  );
  if (res.status !== "applied") {
    console.log("FAILED - XTZ HASH : ", res.operation_group_hash);
    console.log("STATUS : ", res.status, "\nREASON : ", res.errors);
  } else console.log("CONFIRMED - XTZ HASH : ", res.operation_group_hash);
};
