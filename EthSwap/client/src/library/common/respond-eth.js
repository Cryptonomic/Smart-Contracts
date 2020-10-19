import initWait from "../tezos/operations/initiateWait";
import getSwapTez from "../tezos/operations/getSwap";
import getSwapEth from "../ethereum/operations/getSwap";
import addCounterParty from "../tezos/operations/addCounterParty";
import redeem from "../ethereum/operations/redeem";
import getRedeemedSecret from "../tezos/operations/getRedeemedSwap";
import refund from "../tezos/operations/refund";

const waitCompletion = (
  hashedSecret,
  ethStore,
  tezStore,
  refundTime,
  update
) => {
  const id = setInterval(async () => {
    const swp = await getSwapTez(hashedSecret);
    console.log("WAITING TO COMPLETE SWAP");
    if (swp !== undefined) {
      if (Math.trunc(Date.now() / 1000) >= refundTime) {
        clearInterval(id);
        await refund(tezStore, hashedSecret);
        update(hashedSecret, 4);
      }
      return;
    }
    clearInterval(id);
    console.log("\nCOMPLETING SWAP");
    const secret = await getRedeemedSecret(hashedSecret);
    await redeem(ethStore.web3, ethStore, hashedSecret, secret);
    update(hashedSecret, 3);
  }, 180000);
};

const respondEth = async (amount, ethStore, tezStore, req_swap, update) => {
  //create new swap response on ethereum
  const refundTime = req_swap.refundTimestamp - 3600;
  const status = await initWait(
    tezStore,
    ethStore.keyStore.address,
    Math.round(amount * 1000000) + "",
    req_swap.hashedSecret,
    refundTime
  );

  if (!status) return undefined;

  console.log("\nSWAP GENERATED | HASH: ", req_swap.hashedSecret);

  // watch swap response
  const tid = setInterval(async () => {
    if (Math.trunc(Date.now() / 1000) >= refundTime) {
      clearInterval(tid);
      await refund(tezStore, req_swap.hashedSecret);
      update(req_swap.hashedSecret, 4);
      return;
    }
    const swp = await getSwapEth(ethStore, req_swap.hashedSecret);
    console.log("CHECKING FOR SWAP RESPONSE");
    if (swp.participant !== ethStore.keyStore.address) return;
    clearInterval(tid);
    console.log("\nA SWAP RESPONSE FOUND : \n", swp);
    await addCounterParty(tezStore, swp.initiator_tez, req_swap.hashedSecret);
    update(req_swap.hashedSecret, 2);
    waitCompletion(
      req_swap.hashedSecret,
      ethStore,
      tezStore,
      refundTime,
      update
    );
  }, 180000);

  return {
    hashedSecret: req_swap.hashedSecret,
    value: amount + " XTZ",
    refundTime,
    state: 1,
  };
};

export default respondEth;
