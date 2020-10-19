const initTezos = require("../library/tezos/init");
const initEthereum = require("../library/ethereum/init");
const config = require("./config.json");
const initiateWait = require("../library/tezos/initiateWait");
const tezosBalance = require("../library/tezos/getAccountBalance");
const ethBalance = require("../library/ethereum/getAccountBalance");
const storeTezos = require("../library/tezos/store");
const storeEth = require("../library/ethereum/store");
const createSecrets = require("../library/common/createSecrets");
const getSwapTez = require("../library/tezos/getSwap");
const getSwapEth = require("../library/ethereum/getSwap");
const addCounterParty = require("../library/tezos/addCounterParty");
const redeem = require("../library/ethereum/redeem");
// const addCounterParty = require("../library/tezos/addCounterParty");

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
    "ETHEREUM ACCOUNT :",
    storeEth.keyStore.address,
    "\nBALANCE: ",
    balanceEth / Math.pow(10, 18),
    "ETH"
  );
};

const waitCompletion = (web3, secret) => {
  const tid = setInterval(async () => {
    const swp = await getSwapEth(secret.hashedSecret);
    console.log("WAITING TO COMPLETE SWAP");
    if (swp.participant != storeEth.keyStore.address) return;
    clearInterval(tid);
    console.log("\nCOMPLETING SWAP");
    await redeem(web3, secret.hashedSecret, secret.secret);
  }, 180000);
};

const Start = async () => {
  console.log("STARTING XTZ->ETH SWAP\n");
  // Initialize network connections
  await initTezos(config.tezos.private_key);
  const web3 = initEthereum(config.ethereum.RPC, config.ethereum.private_key);

  await showUserDetails(web3);

  // generate swap secret
  const secret = createSecrets();
  console.log("Your SWAP Secret : ", secret);

  // create new swap with refund time set to
  await initiateWait(
    storeEth.keyStore.address,
    config.tezos.swap_amount,
    secret.hashedSecret,
    Math.trunc(Date.now() / 1000) + 7200
  );
  console.log("\nSWAP Generated : ");
  const swap = await getSwapTez(secret.hashedSecret);
  console.log(JSON.stringify(swap));

  // watch swap response
  const tid = setInterval(async () => {
    const swp = await getSwapEth(secret.hashedSecret);
    console.log("CHECKING FOR SWAP RESPONSE");
    if (swp.initiator_tez == "" && swp.refundTimestamp == "0") return;
    clearInterval(tid);
    console.log("\nA SWAP RESPONSE FOUND : \n", swp);
    await addCounterParty(swp.initiator_tez, secret.hashedSecret);
    waitCompletion(web3, secret);
  }, 180000);
};
Start();
