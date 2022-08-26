import { getStorage } from "./operation";

export const getThreshold = async (a) => {

    const storage = await getStorage(a);
    return storage["threshold"];

};

export const getSigners = async (a) => {

    const storage = await getStorage(a);
    return storage["signers"];

};

export const getTransfers = async (a) => {

    const storage = await getStorage(a);
    return storage["transferMap"];

};

export const getOperationNumber = async (a) => {

    const storage = await getStorage(a);
    return storage["operationId"];

}