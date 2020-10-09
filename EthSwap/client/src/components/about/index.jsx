import React from "react";
import useStyles from "./style";
const About = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <p>
        <h2>What are Atomic Swaps?</h2>
        Atomic swaps are automated, self-enforcing crypto-currency exchange
        contracts
        <br />
        that allow crypto-currencies to be traded peer-to-peer without the need
        for a trusted third party.
        <br />
        <h2>Why TrueSwap?</h2>
        The goal of atomic swaps was to remove any need for centralized 3rd
        parties, but most exchanges that provide "Decentralized" Atomic Swaps
        have some form of centralized backend service which is being used for
        either order book maintenance, order matching or both. <br />
        <b>TrueSwap</b> provides complete Decentralized Atomic Swaps, it is not
        dependant on any centralized third-party service.
        <br />
        All stages of a swap are performed by the client application(this
        website), hence it is mandatory for the client to be active throughout
        the swap. If the app is disconnected or closed before a swap is
        completed or refunded the data will be lost and your swap assets will
        not be recoverable.
        <br />
        <h2>How to Perform a Swap?</h2>
        Currently TrueSwap provides cross chain atomic swaps between Ethereum
        and Tezos, to start a swap follow these steps :
        <p className={classes.list}>
          1. Visit the <b>New Swap</b> option from the navigation. <br />
          2. Select which crypto-currency you want to swap(ETH-{">"}XTZ or XTZ-
          {">"}ETH). <br />
          3. In the following screen you can either create an new swap by
          entering the amount you want
          <br />
          to exchange on the left side or select from the existing swaps on the
          right. <br />
          4. Once a swap is generated you can see the Swap state in the{" "}
          <b>Home</b> page.
        </p>
        <br />
        The swap can can be in the following states :<br />
      </p>
      <p className={classes.list}>
        1. Running[1] : Swap Request initiated, waiting for response Swaps.
        <br /> 2. Running[2] : Swap response has been found and can proceed to
        completion. <br />
        3. Completed : The Swap was successfully completed. <br />
        4. Refunded : There was no Response for the Swap, it expired and the
        funds have been returned.
      </p>
    </div>
  );
};

export default About;
