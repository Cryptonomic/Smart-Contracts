const initTezos = require("../library/tezos/init");
const initEthereum = require("../library/ethereum/init");
const config = require("./config.json");
const initiateWait = require("../library/ethereum/initiateWait");
const tezosBalance = require("../library/tezos/getAccountBalance");
const ethBalance = require("../library/ethereum/getAccountBalance");
const storeTezos = require("../library/tezos/store");
const storeEth = require("../library/ethereum/store");
const getSwapTez = require("../library/tezos/getSwap");
const getSwapEth = require("../library/ethereum/getSwap");
const addCounterParty = require("../library/ethereum/addCounterParty");
const redeem = require("../library/tezos/redeem");
const getSwaps = require("../library/tezos/getSwaps");
const getConversionRate = require("../library/common/getConversionRate");
const reader = require("readline-sync");
const getRedeemedSwap = require("../library/ethereum/getRedeemedSwap");

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

const waitCompletion = (hashedSecret) => {
  const id = setInterval(async () => {
    const swp = await getSwapEth(hashedSecret);
    console.log("WAITING TO COMPLETE SWAP");
    if (swp.initiator_tez != "" && swp.refundTimestamp != "0") return;
    clearInterval(id);
    console.log("\nCOMPLETING SWAP");
    const secret = await getRedeemedSwap(hashedSecret);
    await redeem(hashedSecret, secret);
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
      `${i + 1}. Hash : ${swp.hashedSecret}\nXTZ-Value: ${
        swp.value / 1000000
      }XTZ\nETH To Pay: ${swp.value / (rate * 1000000)}ETH`
    );
  });
  let swapno = reader.question(`Enter Swap No. to respond : `);
  const req_swap = swaps[swapno - 1];
  console.log(
    `\nSTARTING SWAP RESPONSE FOR : \nHash : ${
      req_swap.hashedSecret
    }\nXTZ-Value: ${req_swap.value / 1000000}XTZ\nETH To Pay: ${
      req_swap.value / (rate * 1000000)
    }ETH`
  );

  //create new swap response on ethereum
  await initiateWait(
    web3,
    req_swap.hashedSecret,
    req_swap.refundTimestamp - 3600,
    storeTezos.keyStore.publicKeyHash,
    (req_swap.value / (rate * 1000000)).toString()
  );
  console.log("\nSWAP GENERATED | HASH: ", req_swap.hashedSecret);

  // watch swap response
  const tid = setInterval(async () => {
    const swp = await getSwapTez(req_swap.hashedSecret);
    console.log("CHECKING FOR SWAP RESPONSE");
    if (swp.participant != storeTezos.keyStore.publicKeyHash) return;
    clearInterval(tid);
    console.log("\nA SWAP RESPONSE FOUND : \n", swp);
    await addCounterParty(web3, req_swap.hashedSecret, swp.initiator_eth);
    waitCompletion(req_swap.hashedSecret);
  }, 180000);
};
Start();
