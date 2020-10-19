import initWait from "../ethereum/operations/initiateWait";
import getSwapTez from "../tezos/operations/getSwap";
import getSwapEth from "../ethereum/operations/getSwap";
import addCounterParty from "../ethereum/operations/addCounterParty";
import redeem from "../tezos/operations/redeem";
import getRedeemedSecret from "../ethereum/operations/getRedeemedSwap";
import refund from "../ethereum/operations/refund";

const waitCompletion = (
  hashedSecret,
  ethStore,
  tezStore,
  refundTime,
  update
) => {
  const id = setInterval(async () => {
    const swp = await getSwapEth(ethStore, hashedSecret);
    console.log("WAITING TO COMPLETE SWAP");
    if (swp.initiator_tez !== "" && swp.refundTimestamp !== "0") {
      if (Math.trunc(Date.now() / 1000) >= refundTime) {
        clearInterval(id);
        await refund(ethStore.web3, ethStore, hashedSecret);
        update(hashedSecret, 4);
      }
      return;
    }
    clearInterval(id);
    console.log("\nCOMPLETING SWAP");
    const secret = await getRedeemedSecret(ethStore, hashedSecret);
    await redeem(tezStore, hashedSecret, secret);
    update(hashedSecret, 3);
  }, 180000);
};

const respondTezos = async (amount, ethStore, tezStore, req_swap, update) => {
  //create new swap response on ethereum
  const refundTime = req_swap.refundTimestamp - 3600;
  const status = await initWait(
    ethStore.web3,
    ethStore,
    req_swap.hashedSecret,
    refundTime,
    tezStore.keyStore.publicKeyHash,
    amount.toString()
  );

  if (!status) return undefined;

  console.log("\nSWAP GENERATED | HASH: ", req_swap.hashedSecret);

  // watch swap response
  const tid = setInterval(async () => {
    if (Math.trunc(Date.now() / 1000) >= refundTime) {
      clearInterval(tid);
      await refund(ethStore.web3, ethStore, req_swap.hashedSecret);
      update(req_swap.hashedSecret, 4);
      return;
    }
    const swp = await getSwapTez(req_swap.hashedSecret);
    console.log("CHECKING FOR SWAP RESPONSE");
    if (swp.participant !== tezStore.keyStore.publicKeyHash) return;
    clearInterval(tid);
    console.log("\nA SWAP RESPONSE FOUND : \n", swp);
    await addCounterParty(
      ethStore.web3,
      ethStore,
      req_swap.hashedSecret,
      swp.initiator_eth
    );
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
    value: amount + " ETH",
    refundTime,
    state: 1,
  };
};

export default respondTezos;
