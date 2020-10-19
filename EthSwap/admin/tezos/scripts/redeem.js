const invokeContract = require("../util/invokeContract");
const init = require("../init");
//0xfa45bdbbf85932ae5b92aeb67fdd65d57716458a59db8d76ebc64c8675bc03ba 0x4021bac7d1db073e69297025b7624382aaa3e51419ee0774cfad33fc1c01655a
const secret =
    "0x4021bac7d1db073e69297025b7624382aaa3e51419ee0774cfad33fc1c01655a",
  secretHash =
    "0xfa45bdbbf85932ae5b92aeb67fdd65d57716458a59db8d76ebc64c8675bc03ba";

init().then(() => {
  invokeContract(0, "redeem", `(Pair ${secretHash} ${secret})`, 100000, 300)
    .then((res) => {
      if (res.status !== "applied") {
        console.log("FAILED - XTZ HASH : ", res.operation_group_hash);
        console.log("STATUS : ", res.status, "\nREASON : ", res.errors);
      } else console.log("CONFIRMED - XTZ HASH : ", res.operation_group_hash);
    })
    .catch((err) => {
      console.error("ERROR : ", err);
    });
});
