import React from "react";
import { useHistory } from "react-router-dom";
import useStyles from "./style";

const Home = ({ swaps }) => {
  const history = useHistory();
  const classes = useStyles();
  const SwapItem = (data) => {
    const exp = new Date(data.refundTime * 1000);
    const state = {
      1: "Running[1]",
      2: "Running[2]",
      3: "Completed",
      4: "Refunded",
    };
    return (
      <div className={classes.swap} key={data.hashedSecret}>
        <p>Hash : {data.hashedSecret}</p>
        <p>Value : {data.value}</p>
        <p>Expiry Time : {exp.toLocaleString()}</p>
        <p>State : {state[data.state]}</p>
      </div>
    );
  };
  let data = (
    <div className={classes.noSwap}>
      <p>
        No Swaps Created Yet! Learn more about <b>TrueSwap</b> and how to create
        your own Atomic Swap
      </p>
      <button className={classes.button} onClick={() => history.push("/about")}>
        Learn More
      </button>
      <p>or create a Swap now!</p>
      <button
        className={classes.button}
        onClick={() => history.push("/create")}
      >
        Start New Swap
      </button>
    </div>
  );
  if (swaps !== undefined)
    data = Object.keys(swaps).map((key) => SwapItem(swaps[key]));
  return (
    <div>
      <div className={classes.swaps}>
        <h3>Your Swaps</h3>
        {data}
      </div>
    </div>
  );
};

export default Home;
