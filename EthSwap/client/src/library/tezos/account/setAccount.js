import { KeyStoreUtils, SoftSigner } from "conseiljs-softsigner";
import { TezosMessageUtils } from "conseiljs";

const setTezAccount = async (key, tezSetup) => {
  const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(key);
  const signer = await SoftSigner.createSigner(
    TezosMessageUtils.writeKeyWithHint(key, "edsk"),
    -1
  );
  return { keyStore, signer };
};

export default setTezAccount;
