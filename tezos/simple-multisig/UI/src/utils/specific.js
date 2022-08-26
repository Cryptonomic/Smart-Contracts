import { getStorage } from "./operation";

export const getThreshold = async () => {

    const storage = await getStorage();
    return storage["threshold"];

};

export const getSigners = async () => {

    const storage = await getStorage();
    return storage["signers"];

};

export const getTransfers = async () => {

    const storage = await getStorage();
    return storage["transferMap"];

};

export const getOperationNumber = async () => {

    const storage = await getStorage();
    return storage["operationId"];

}