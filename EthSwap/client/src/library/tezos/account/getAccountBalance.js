import { TezosNodeReader } from "conseiljs";
import config from "../../../globalConfig.json";

const accountBalanceTez = async (address) => {
  const result = await TezosNodeReader.getSpendableBalanceForAccount(
    config.tezos.RPC,
    address
  );
  return result;
};

export default accountBalanceTez;
