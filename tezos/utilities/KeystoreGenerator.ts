import { TezosWalletUtil, TezosConseilClient } from 'conseiljs';

interface accountInformation {
    mnemonic: Array<string>;
    pkh: string;
    password: string;
    email: string;
}

export async function generateKeystore(alphanetFaucetAccount: accountInformation) {
    return await TezosWalletUtil.unlockFundraiserIdentity(alphanetFaucetAccount.mnemonic.join(' '), alphanetFaucetAccount.email, alphanetFaucetAccount.password, alphanetFaucetAccount.pkh);
}