import {tezos} from "./tezos";
import { MichelsonMap } from '@taquito/taquito';
import { getAccount } from "./wallet";

const genericMultisigJSONfile12 = require('../code/fa12.json');
const genericMultisigJSONfile2 = require('../code/fa2.json');


// test token: KT1HsWF8S8NDBCjEFMv6mBTkrStaVrc88u9f
// test token: KT1UotGXB1u8Uw4r5R7BR6F13VH9CVaFP4WX
const contractAddressTest = "KT1TCUbHBjHbgqcMsBGwjD85XZSzcwfKHpP6";

export const originateMultisig2 = async () => {

    const address = await getAccount();

    console.log(address);

    const storage = {
        "prim": "Pair",
        "args": [
          { "prim": "Pair", "args": [ [], { "prim": "Pair", "args": [ { "int": "1" }, { "int": "0" } ] } ] },
          {
            "prim": "Pair",
            "args": [
              {
                "prim": "Pair",
                "args": [
                  [
                    {
                      "prim": "Elt",
                      "args": [
                        { "string": "tz1QzQrmKGViLFaLQtwzn4Y76XRvDLVWDMN3" },
                        { "prim": "Pair", "args": [ { "prim": "True" }, { "prim": "Pair", "args": [ [], [ { "string": "tz1eenWdHZ54MpSWWUUudZVjaVtecC2VBBeg" } ] ] } ] }
                      ]
                    }
                  ],
                  { "int": "1" }
                ]
              },
              { "prim": "Pair", "args": [ [], [] ] }
            ]
          }
        ]
      };


      tezos.wallet
      .originate({
        code: genericMultisigJSONfile2,
        init: storage,
      })
      .send()
      .then((originationOp) => {
        console.log(`Waiting for confirmation of origination...`);
        //return originationOp.contract();
      })
      .then((contract) => {
        console.log(`Origination completed for ${contract.address}.`);
        return contract.address;
      })
      .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));

};


export const originateMultisig12 = async () => {

    const address = await getAccount();

    console.log(address);

    const storage = {
        "prim": "Pair",
        "args": [
          { "prim": "Pair", "args": [ [], { "prim": "Pair", "args": [ { "int": "1" }, { "int": "0" } ] } ] },
          {
            "prim": "Pair",
            "args": [
              {
                "prim": "Pair",
                "args": [
                  [
                    {
                      "prim": "Elt",
                      "args": [
                        { "string": address },
                        { "prim": "Pair", "args": [ { "prim": "True" }, { "prim": "Pair", "args": [ [], [ { "string": "tz1eenWdHZ54MpSWWUUudZVjaVtecC2VBBeg" } ] ] } ] }
                      ]
                    }
                  ],
                  { "int": "1" }
                ]
              },
              { "prim": "Pair", "args": [ [], [] ] }
            ]
          }
        ]
      };

      tezos.wallet
      .originate({
        code: genericMultisigJSONfile12,
        init: storage,
      })
      .send()
      .then((originationOp) => {
        console.log(`Waiting for confirmation of origination...`);
        return originationOp.contract();
      })
      .then((contract) => {
        console.log(`Origination completed for ${contract.address}.`);
        //return contract.address;
      })
      .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));

};


export const addSignerOperation = async (signer) => {

    
    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.addSigner(signer).send();
    await op.confirmation();

   

};

export const removeSignerOperation = async (signer) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.removeSigner(signer).send();
    await op.confirmation();


};

export const addThreshold = async (threshold) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.updateThreshold(threshold).send();
    await op.confirmation();


};

export const removeThreshold = async (threshold) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.removeThresholdProp(threshold).send();
    await op.confirmation();


};

export const addDelegate = async (delegate) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.addDelegate(delegate).send();
    await op.confirmation();


};

export const removeDelegate = async (delegate) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.removeDelegate(delegate).send();
    await op.confirmation();


};

export const addTransfer = async (transfer) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.transfer(transfer.amount, transfer.receiver, transfer.tokenAddress, transfer.tokenId).send();
    await op.confirmation();


};

export const addMint = async (mint) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    // const storageMap = new MichelsonMap({
    //     "decimals"    : "18",            
    //     "name"        : "My Great Token",  
    //     "symbol"      : "MGT",              
    // });
    const op = await contract.methods.mint(mint.amount, mint.receiver, mint.tokenAddress).send();
    await op.confirmation();

};

export const addRecover = async (recover) =>{

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.recoverToken(recover.amount,recover.receiver,).send();
    await op.confirmation();

};

export const getStorage = async () => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const storage = await contract.storage();
    return storage;

};

export const sign = async (id) => {

    console.log(id);

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.signAndExecute(id).send();
    await op.confirmation();

}

export const unsign = async (id) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.unsign(id).send();
    await op.confirmation();

}

export const adminSwitch = async (admin) => {

    const contract = await tezos.wallet.at(contractAddressTest);
    const op = await contract.methods.addAdminSwitch(admin.receiver, admin.tokenAddress).send();
    await op.confirmation();

}









