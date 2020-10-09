import React, { useEffect } from "react";
import { useState } from "react";
import accountBalanceEth from "../../library/ethereum/account/getAccountBalance";
import accountBalanceTez from "../../library/tezos/account/getAccountBalance";
import useStyles from "./style";
import { useHistory } from "react-router-dom";
import { shorten, truncate } from "../../util";

const Header = ({ ethStore, tezStore, balUpdate }) => {
  const [balance, setBalance] = useState({ eth: 0, tez: 0 });
  const classes = useStyles();
  const history = useHistory();
  const updateBalance = async () => {
    let eth = await accountBalanceEth(ethStore.web3, ethStore.keyStore.address);
    let tez = await accountBalanceTez(tezStore.keyStore.publicKeyHash);
    eth = eth / Math.pow(10, 18);
    tez = tez / 1000000;
    balUpdate({ eth, tez });
    setBalance({ eth, tez });
  };

  useEffect(() => {
    updateBalance();
    const timer = setInterval(async () => {
      await updateBalance();
    }, 60000);
    return () => {
      clearInterval(timer);
    };
  }, [ethStore.keyStore.address, tezStore.keyStore.publicKeyHash]);

  return (
    <div className={classes.header}>
      <div className={classes.account}>
        <p>Ethereum Addr.: {shorten(5, 5, ethStore.keyStore.address)}</p>
        <p>Balance : {truncate(balance.eth, 4)} ETH</p>
      </div>
      <div className={classes.nav}>
        <h1 className={classes.title}>TrueSwap</h1>
        <button className={classes.button} onClick={() => history.push("/")}>
          Home
        </button>
        <button
          className={classes.button}
          onClick={() => history.push("/about")}
        >
          About
        </button>
        <button
          className={classes.button}
          onClick={() => history.push("/create")}
        >
          New Swap
        </button>
      </div>
      <div className={classes.account}>
        <p>Tezos Addr.: {shorten(5, 5, tezStore.keyStore.publicKeyHash)}</p>
        <p>Balance : {truncate(balance.tez, 4)} XTZ</p>
      </div>
    </div>
  );
};

export default Header;
