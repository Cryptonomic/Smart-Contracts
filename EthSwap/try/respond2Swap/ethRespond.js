const initTezos = require("../library/tezos/init");
const initEthereum = require("../library/ethereum/init");
const config = require("./config.json");
const initiateWait = require("../library/tezos/initiateWait");
const tezosBalance = require("../library/tezos/getAccountBalance");
const ethBalance = require("../library/ethereum/getAccountBalance");
const storeTezos = require("../library/tezos/store");
const storeEth = require("../library/ethereum/store");
const getSwapTez = require("../library/tezos/getSwap");
const getSwapEth = require("../library/ethereum/getSwap");
const addCounterParty = require("../library/tezos/addCounterParty");
const redeem = require("../library/ethereum/redeem");
const getSwaps = require("../library/ethereum/getSwaps");
const getConversionRate = require("../library/common/getConversionRate");
const reader = require("readline-sync");
const getRedeemedSwap = require("../library/tezos/getRedeemedSwap");

const showUserDetails = async (web3) => {
  const balanceTez = await tezosBalance(storeTezos.keyStore.publicKeyHash);
  console.log(
    "TEZOS ACCOUNT :",
    storeTezos.keyStore.publicKeyHash,
    "\nBALANCE: ",
    balanceTez / 1000000,
    "XTZ"
  );
  const balanceEth = await ethBalance(web3, storeEth.keyStore.address);
  console.log(
    "\nETHEREUM ACCOUNT :",
    storeEth.keyStore.address,
    "\nBALANCE: ",
    balanceEth / Math.pow(10, 18),
    "ETH"
  );
};

const waitCompletion = (web3, hashedSecret) => {
  const id = setInterval(async () => {
    const swp = await getSwapTez(hashedSecret);
    console.log("WAITING TO COMPLETE SWAP");
    if (swp != undefined) return;
    clearInterval(id);
    console.log("\nCOMPLETING SWAP");
    const secret = await getRedeemedSwap(hashedSecret);
    await redeem(web3, hashedSecret, secret);
  }, 180000);
};

const Start = async () => {
  // Initialize network connections
  await initTezos(config.tezos.private_key);
  const web3 = initEthereum(config.ethereum.RPC, config.ethereum.private_key);

  await showUserDetails(web3);

  //get conversion rate
  const rate = await getConversionRate();
  console.log(`\nCURRENT RATE : 1ETH -> ${rate}XTZ`);
  // get all swaps
  const swaps = await getSwaps();
  console.log("\nSELECT YOUR SWAP : \n");
  swaps.forEach((swp, i) => {
    console.log(
      `${i + 1}. Hash : ${swp.hashedSecret}\nETH-Value: ${
        swp.value / Math.pow(10, 18)
      }ETH\nXTZ To Pay: ${(swp.value * rate) / Math.pow(10, 18)}XTZ`
    );
  });
  let swapno = reader.question(`Enter Swap No. to respond : `);
  const req_swap = swaps[swapno - 1];
  console.log(
    `\nSTARTING SWAP RESPONSE FOR : \nHash : ${
      req_swap.hashedSecret
    }\nETH-Value: ${req_swap.value / Math.pow(10, 18)}ETH\nXTZ To Pay: ${
      (req_swap.value * rate) / Math.pow(10, 18)
    }XTZ`
  );

  //create new swap response on ethereum
  await initiateWait(
    storeEth.keyStore.address,
    Math.round((req_swap.value * rate) / Math.pow(10, 12)).toString(),
    req_swap.hashedSecret,
    req_swap.refundTimestamp - 3600
  );
  console.log("\nSWAP GENERATED | HASH: ", req_swap.hashedSecret);

  // watch swap response
  const tid = setInterval(async () => {
    const swp = await getSwapEth(req_swap.hashedSecret);
    console.log("CHECKING FOR SWAP RESPONSE");
    if (swp.participant != storeEth.keyStore.address) return;
    clearInterval(tid);
    console.log("\nA SWAP RESPONSE FOUND : \n", swp);
    await addCounterParty(swp.initiator_tez, req_swap.hashedSecret);
    waitCompletion(web3, req_swap.hashedSecret);
  }, 180000);
};
Start();
