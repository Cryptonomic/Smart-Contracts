import { TezosNodeReader } from "conseiljs";
import config from "../../globalConfig.json";
import { JSONPath } from "jsonpath-plus";

const getConvertionRate = async () => {
  let data = await TezosNodeReader.getValueForBigMapKey(
    config.tezos.tezosNode,
    14981,
    "exprukkbxD4rqiYFhFNSkLHfyEfbVEMirvDS9naHRjGKbzPsREJfmc",
    undefined,
    config.tezos.chain_id
  );
  const xtzPrice = Number(
    JSONPath({ path: "$.args[0].args[0].int", json: data })[0]
  );
  data = await TezosNodeReader.getValueForBigMapKey(
    config.tezos.tezosNode,
    14981,
    "exprv9NLX1skZHFM1i6eXc7eAazz25T1BVjkDzc47fWEEjn6y2Zsay",
    undefined,
    config.tezos.chain_id
  );
  const ethPrice = Number(
    JSONPath({ path: "$.args[0].args[0].int", json: data })[0]
  );
  return ethPrice / xtzPrice;
};

export default getConvertionRate;
