// main.ts
import { App } from './src/app';

const RPC_URL = "https://jakartanet.ecadinfra.com";
const FA2ADDRESS = "KT1WYzvyfSBpv7MVw4gUGcpbSn6dRbz5REgH";
const FA12ADDRESS = "KT1K9h6DDBcHL37R7BZvBUfSgJRPw7rpnpJR";


//new App(RPC_URL).getContractEntrypoints(FA2ADDRESS);
//new App(RPC_URL).rdelegate(FA2ADDRESS);
new App(RPC_URL).delegate(FA12ADDRESS);
