import React from "react";
import useStyles from "./style";
const Setup = ({ init }) => {
  const setup = (e) => {
    e.preventDefault();
    if (e.target.eth.value !== "" && e.target.tez.value !== "")
      init(e.target.eth.value, e.target.tez.value);
  };
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.intro}>
        <h1 className={classes.title}>TrueSwap</h1>
        <p>Cross-Chain Atomic Swaps for Ethereum and Tezos</p>
        <p>
          *Do not refresh or close the app during a running swap, your swaps
          will be lost
        </p>
      </div>
      <form className={classes.form} onSubmit={setup}>
        <input
          className={classes.input}
          type="password"
          placeholder="ethereum private key [goerli-testnet]"
          name="eth"
        />
        <input
          className={classes.input}
          type="password"
          placeholder="tezos private key [carthagenet]"
          name="tez"
        />
        <input className={classes.submit} type="submit" value="START" />
      </form>
    </div>
  );
};

export default Setup;
