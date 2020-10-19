const invokeContract = require("./util/invokeContract");

// const secret =
//     "0x65df6f8f03439232780755c26560398280be8f4af49e0813b1e8132819d2a371",
//   secretHash =
//     "0xecb99bf78f9a21af53b860e5f4dd007555a55f590a93222b58230fc43751c4ea";

module.exports = async (hashedSecret, secret) => {
  const res = await invokeContract(
    0,
    "redeem",
    `(Pair ${hashedSecret} ${secret})`,
    100000,
    300
  );
  if (res.status !== "applied") {
    console.log("FAILED - XTZ HASH : ", res.operation_group_hash);
    console.log("STATUS : ", res.status, "\nREASON : ", res.errors);
  } else console.log("CONFIRMED - XTZ HASH : ", res.operation_group_hash);
};
