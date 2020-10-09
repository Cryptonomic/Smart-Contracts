const invokeContract = require("../util/invokeContract");
const init = require("../init");

const tezAccount = "tz1TjCVuTLE7mHRJdS8GDYhtmjTu1eAncq8e",
  secret = "0xc43f27559058c3d3427dfd13106a52815822b022aad70b8fb21824e0888f8665";

init().then(() => {
  invokeContract(0, "refund", `${secret}`, 100000)
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
