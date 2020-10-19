const invokeContract = require("./util/invokeContract");

// const ethAddress = "0x91f79893E7B923410Ef1aEba6a67c6fab07D800C",
//   amtMuTez = 5000000,
//   secretBytes =
//     "0xecb99bf78f9a21af53b860e5f4dd007555a55f590a93222b58230fc43751c4ea",
//   time = Math.trunc(Date.now() / 1000) + 300;

module.exports = async (ethAddress, amtMuTez, hashedSecret, time) => {
  const res = await invokeContract(
    amtMuTez,
    "initiateWait",
    `(Pair ${hashedSecret} (Pair "${time}" "${ethAddress}"))`,
    10000,
    300
  );
  if (res.status !== "applied") {
    console.log("FAILED - XTZ HASH : ", res.operation_group_hash);
    console.log("STATUS : ", res.status, "\nREASON : ", res.errors);
  } else console.log("CONFIRMED - XTZ HASH : ", res.operation_group_hash);
};
