// TODO 1 - Setup Tezos Toolkit
import { TezosToolkit } from "@taquito/taquito";
import {wallet} from "./wallet";

const RPC_URL = "https://jakartanet.ecadinfra.com";

export const tezos = new TezosToolkit(RPC_URL);

tezos.setWalletProvider(wallet);

// TODO 3 - Specify wallet provider for Tezos instance
