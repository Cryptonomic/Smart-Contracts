import getSwapTez from "../tezos/operations/getSwap";
import getSwapEth from "../ethereum/operations/getSwap";
import initWait from "../tezos/operations/initiateWait";
import createSecrets from "./createSecrets";
import addCounterParty from "../tezos/operations/addCounterParty";
import redeem from "../ethereum/operations/redeem";
import refund from "../tezos/operations/refund";

const waitCompletion = (secret, tezStore, ethStore, refundTime, update) => {
  const tid = setInterval(async () => {
    if (Math.trunc(Date.now() / 1000) >= refundTime) {
      clearInterval(tid);
      await refund(tezStore, secret.hashedSecret);
      update(secret.hashedSecret, 4);
      return;
    }
    const swp = await getSwapEth(ethStore, secret.hashedSecret);
    console.log("WAITING TO COMPLETE SWAP");
    if (swp.participant !== ethStore.keyStore.address) return;
    clearInterval(tid);
    console.log("\nCOMPLETING SWAP");
    await redeem(ethStore.web3, ethStore, secret.hashedSecret, secret.secret);
    update(secret.hashedSecret, 3);
  }, 180000);
};

const requestTezos = async (amount, ethStore, tezStore, update) => {
  // generate swap secret
  const secret = createSecrets();
  console.log("Your SWAP Secret (XTZ->ETH): ", secret);

  // create new swap with refund time set to 2hrs
  const refundTime = Math.trunc(Date.now() / 1000) + 7200;
  const status = await initWait(
    tezStore,
    ethStore.keyStore.address,
    amount * 1000000 + "",
    secret.hashedSecret,
    refundTime
  );

  if (!status) return undefined;

  console.log("\nSWAP Generated : ");
  const swap = await getSwapTez(secret.hashedSecret);
  console.log(JSON.stringify(swap));

  // watch swap response
  const tid = setInterval(async () => {
    if (Math.trunc(Date.now() / 1000) >= refundTime) {
      clearInterval(tid);
      await refund(tezStore, secret.hashedSecret);
      update(secret.hashedSecret, 4);
      return;
    }
    const swp = await getSwapEth(ethStore, secret.hashedSecret);
    console.log("CHECKING FOR SWAP RESPONSE");
    if (swp.initiator_tez === "" && swp.refundTimestamp === "0") return;
    clearInterval(tid);
    console.log("\nA SWAP RESPONSE FOUND : \n", swp);
    await addCounterParty(tezStore, swp.initiator_tez, secret.hashedSecret);
    update(secret.hashedSecret, 2);
    waitCompletion(secret, tezStore, ethStore, refundTime, update);
  }, 180000);

  return {
    hashedSecret: secret.hashedSecret,
    value: amount + " XTZ",
    refundTime,
    state: 1,
  };
};

export default requestTezos;
