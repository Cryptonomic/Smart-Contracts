import { BeaconWallet } from "@taquito/beacon-wallet";

export const wallet = new BeaconWallet({

    name: "Multisig",
    preferredNetwork: "jakartanet"

});

export const connectWallet = async () => {

    //await wallet.clearActiveAccount();

    await wallet.requestPermissions({
        network: {
            type: "jakartanet"
        }
    });

};

export const getAccount = async () =>{
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount){
        return activeAccount.address;
    }else{
        return "";
    }
};