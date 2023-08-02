import { useEffect, useState } from "react";
import { getStorage, sign, unsign } from "../utils/operation";
import { getTransfers } from "../utils/specific";
import Transaction from "./Transaction";

function Storage({contractAddress}){



    const [storage, setStorage] = useState();
    const [display, setDisplay] = useState([]);



    useEffect(() => {
       
        parseMap();
    }, []);

    const signAction = async (id) => {
        console.log(id);
        await sign(id, contractAddress);
    };

    const unsignAction = async (id) => {
        await unsign(id, contractAddress);
    };

    const parseMap = async () => {

        //Types: 0 transfer, 1 mint, 2 approve, 3 burn, 4 recover, 5 switch admin

        console.log("waiting");


        const storage = await getTransfers(contractAddress);
        setStorage(storage);
        let display = [];
        storage.forEach((value, key) => {
            switch(value.type.toNumber()) {
                case 0:
                  display.push(parseTransfer(value, key.toNumber()));
                  break;
                case 1:
                  display.push(parseMint(value, key.toNumber()));
                  break;
                case 2:
                    display.push(parseApprove(value));
                    break;
                case 5:
                    display.push(parseAdmin(value, key.toNumber()));
                    break;
                case 4: 
                    display.push(parseRecover(value, key.toNumber()));
                    break;
                default:
                  break;
              }
        });

        console.log("done");



        setDisplay(display);

    }

    const parseRecover = (value, key) => {

        return (
                <Transaction 
                    key={key}
                    id={key}
                    type={"Send"}
                    amount={value.amount.toNumber()}
                    receiver={value.receiver}
                    sign={signAction}
                    unsign={unsignAction}
                />
        )

    }

    const parseMint = (value, key) => {

        return (
                <Transaction 
                    key={key}
                    id={key}
                    type={"Mint"}
                    amount={value.amount.toNumber()}
                    receiver={value.receiver}
                    tokenAddress={value.tokenAddress}
                    //tokenID={value.tokenID}
                    sign={signAction}
                    unsign={unsignAction}
                />
        )

    }

    const parseTransfer = (value, key) => {

        return (
                <Transaction 
                    key={key}
                    id={key}
                    type={"Transfer"}
                    amount={value.amount.toNumber()}
                    receiver={value.receiver}
                    tokenAddress={value.tokenAddress}
                    tokenID={value.tokenID}
                    sign={signAction}
                    unsign={unsignAction}
                />
        )

    }

    const parseAdmin = (value, key) => {

        return (
                <Transaction 
                    key={key}
                    id={key}
                    type={"Admin Switch"}
                    receiver={value.receiver}
                    tokenAddress={value.tokenAddress}
                    sign={signAction}
                    unsign={unsignAction}
                />
        )

    }

    const parseApprove = (value, key) => {

        return (
                <Transaction 
                key={key}
                id={key}
                type={"Arrpove"}
                amount={value.amount.toNumber()}
                receiver={value.receiver}
                tokenAddress={value.tokenAddress}
                tokenID={value.tokenID}
                sign={signAction}
                unsign={unsignAction}
                />
        )

    }




    
    return( 
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
           <ul>{display}</ul>
        </div>

    )
}

export default Storage;