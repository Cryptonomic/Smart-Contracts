const { TezosNodeReader } = require("conseiljs");
const config = require("../config/tez-config.json");
const init = require("../tezos/init");
const { JSONPath } = require("jsonpath-plus");

const getConversionRate = async () => {
  await init();
  let data = await TezosNodeReader.getValueForBigMapKey(
    config.tezosNode,
    14981,
    "exprukkbxD4rqiYFhFNSkLHfyEfbVEMirvDS9naHRjGKbzPsREJfmc",
    undefined,
    config.chain_id
  );
  const xtzPrice = Number(
    JSONPath({ path: "$.args[0].args[0].int", json: data })[0]
  );
  data = await TezosNodeReader.getValueForBigMapKey(
    config.tezosNode,
    14981,
    "exprv9NLX1skZHFM1i6eXc7eAazz25T1BVjkDzc47fWEEjn6y2Zsay",
    undefined,
    config.chain_id
  );
  const ethPrice = Number(
    JSONPath({ path: "$.args[0].args[0].int", json: data })[0]
  );
  return ethPrice / xtzPrice;
};
getConversionRate().then(console.log);
