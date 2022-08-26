// src/app.ts
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

export class App {
    private tezos: TezosToolkit;

    constructor(rpcUrl: string) {
        this.tezos = new TezosToolkit(rpcUrl);
        this.tezos.setSignerProvider(InMemorySigner.fromFundraiser("qxuqfygp.zzlplmct@teztnets.xyz", "s1kOhlbRyH", [
            "offer",
            "involve",
            "acid",
            "day",
            "govern",
            "scissors",
            "joke",
            "illegal",
            "radar",
            "room",
            "upgrade",
            "desert",
            "future",
            "change",
            "surround"
        ].join(' ')))
    }


    public getContractEntrypoints(address: string) {
        this.tezos.contract
            .at(address)
            .then((c) => {
                let methods = c.parameterSchema.ExtractSignatures();
                console.log(JSON.stringify(methods, null, 2));
            })
            .catch((error) => console.log(`Error: ${error}`));
    }

    public delegate(contract: string) {
        //let s = 1000000000000000000;
        this.tezos.contract
            .at(contract) // step 1
            .then((contract) => {
                return contract.methods.addDelegate("tz1foXHgRzdYdaLgX6XhpZGxbBv42LZ6ubvE").send(); // steps 2, 3 and 4
            })
            .then((op) => {
                console.log(`Awaiting for ${op.hash} to be confirmed...`);
                return op.confirmation(3).then(() => op.hash); // step 5
            })
            .then((hash) => console.log(`Operation injected: https://ghostnet.smartpy.io/${hash}`))
            .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
    }

    public rdelegate(contract: string) {
        //let s = 1000000000000000000;
        this.tezos.contract
            .at(contract) // step 1
            .then((contract) => {
                return contract.methods.removeDelegate("tz1foXHgRzdYdaLgX6XhpZGxbBv42LZ6ubvE").send(); // steps 2, 3 and 4
            })
            .then((op) => {
                console.log(`Awaiting for ${op.hash} to be confirmed...`);
                return op.confirmation(3).then(() => op.hash); // step 5
            })
            .then((hash) => console.log(`Operation injected: https://ghostnet.smartpy.io/${hash}`))
            .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
    }

}