const invokeContract = require("../util/invokeContract");
const conseiljs = require("conseiljs");
const config = require("../../globalConfig.json");

// const state = "True"; // True or False

module.exports = (state) => {
  const res = await invokeContract(0, "toggleContractState", `${state}`)
  if (res.status !== "applied") {
    console.log("FAILED - XTZ HASH : ", res.operation_group_hash);
    console.log("STATUS : ", res.status, "\nREASON : ", res.errors);
  } else{
    const storage = await conseiljs.TezosNodeReader.getContractStorage(
      config.tezos.RPC,
      config.tezos.contractAddr
    );
    console.log(storage)
  }
};
