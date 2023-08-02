function Transaction(props){
    const type = props.type;
    const id = props.id;

    const tokenID = () => {
        if (props.tokenID === undefined){
            return ;
        }
        else{
            return "TokenID: " + props.tokenID;
        }
    }

    const amount = () => {
        if (props.amount === undefined){
            return ;
        }
        else{
            return "Amount: " + props.amount;
        }
    }
    const tokenAddress = () => {
        if (props.tokenAddress === undefined){
            return ;
        }
        else{
            return "Token address: " + props.tokenAddress;
        }
    }
    return (
        <div>
            <h3>{type + ": " + id}</h3>
            <span>{"Receiver: "+ props.receiver}</span>
            <span>{tokenAddress()}</span>
            <span>{tokenID()}</span>
            <span>{amount()}</span>
            <button onClick={() => props.sign(id)}>
                Sign
            </button>
            <button onClick={() => props.unsign(id)}>
                Unsign
            </button>
        </div>
    )

    
}

export default Transaction;