import getSwapTez from "../tezos/operations/getSwap";
import getSwapEth from "../ethereum/operations/getSwap";
import initWait from "../ethereum/operations/initiateWait";
import createSecrets from "./createSecrets";
import addCounterParty from "../ethereum/operations/addCounterParty";
import redeem from "../tezos/operations/redeem";
import refund from "../ethereum/operations/refund";

const waitCompletion = (secret, tezStore, ethStore, refundTime, update) => {
  const tid = setInterval(async () => {
    if (Math.trunc(Date.now() / 1000) >= refundTime) {
      clearInterval(tid);
      await refund(ethStore.web3, ethStore, secret.hashedSecret);
      update(secret.hashedSecret, 4);
      return;
    }
    const swp = await getSwapTez(secret.hashedSecret);
    console.log("WAITING TO COMPLETE SWAP");
    if (swp.participant !== tezStore.keyStore.publicKeyHash) return;
    clearInterval(tid);
    console.log("\nCOMPLETING SWAP");
    await redeem(tezStore, secret.hashedSecret, secret.secret);
    update(secret.hashedSecret, 3);
  }, 180000);
};

const requestEth = async (amount, ethStore, tezStore, update) => {
  // generate swap secret
  const secret = createSecrets();
  console.log("Your SWAP Secret (XTZ->ETH): ", secret);

  // create new swap with refund time set to 2hrs
  const refundTime = Math.trunc(Date.now() / 1000) + 7200;
  const status = await initWait(
    ethStore.web3,
    ethStore,
    secret.hashedSecret,
    refundTime,
    tezStore.keyStore.publicKeyHash,
    amount + ""
  );
  if (!status) return undefined;

  console.log("\nSWAP Generated : ");
  const swap = await getSwapEth(ethStore, secret.hashedSecret);
  console.log(JSON.stringify(swap));

  // watch swap response
  const tid = setInterval(async () => {
    if (Math.trunc(Date.now() / 1000) >= refundTime) {
      clearInterval(tid);
      await refund(ethStore.web3, ethStore, secret.hashedSecret);
      update(secret.hashedSecret, 4);
      return;
    }
    const swp = await getSwapTez(secret.hashedSecret);
    console.log("CHECKING FOR SWAP RESPONSE");
    if (swp === undefined) return;
    clearInterval(tid);
    console.log("\nA SWAP RESPONSE FOUND : \n", swp);
    await addCounterParty(
      ethStore.web3,
      ethStore,
      secret.hashedSecret,
      swp.initiator_eth
    );
    update(secret.hashedSecret, 2);
    waitCompletion(secret, tezStore, ethStore, refundTime, update);
  }, 180000);

  return {
    hashedSecret: secret.hashedSecret,
    value: amount + " ETH",
    refundTime,
    state: 1,
  };
};

export default requestEth;
