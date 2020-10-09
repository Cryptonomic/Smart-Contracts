const invokeContract = require("../util/invokeContract");
const init = require("../init");
const conseiljs = require("conseiljs");
const config = require("../../config/tez-config.json");

const state = "True"; // True or False

init().then(() => {
  invokeContract(0, "toggleContractState", `${state}`)
    .then((res) => {
      if (res.status !== "applied") {
        console.log("FAILED - XTZ HASH : ", res.operation_group_hash);
        console.log("STATUS : ", res.status, "\nREASON : ", res.errors);
      } else
        return conseiljs.TezosNodeReader.getContractStorage(
          config.RPC,
          config.contractAddr
        );
    })
    .then((res) => console.log(JSON.stringify(res)))
    .catch((err) => {
      console.error("ERROR : ", err);
    });
});
