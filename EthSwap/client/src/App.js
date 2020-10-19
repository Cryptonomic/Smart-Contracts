import React, { useRef, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import About from "./components/about";
import Header from "./components/header";
import Home from "./components/home";
import Loader from "./components/loader";
import Swap from "./components/newSwap";
import Ethereum from "./components/newSwap/ethereum/index.jsx";
import Tezos from "./components/newSwap/tezos";
import Setup from "./components/setup";
import requestEth from "./library/common/request-eth";
import requestTezos from "./library/common/request-tezos";
import respondEth from "./library/common/respond-eth";
import respondTezos from "./library/common/respond-tezos";
import setEthAccount from "./library/ethereum/account/setAccount";
import setTezAccount from "./library/tezos/account/setAccount";

const App = () => {
  const [ethStore, ethSetup] = useState(undefined);
  const [tezStore, tezSetup] = useState(undefined);
  const [swaps, updateSwaps] = useState(undefined);
  const [balance, balUpdate] = useState(undefined);
  const [, updateState] = React.useState();

  const swapRef = useRef();
  swapRef.current = swaps;
  const ethRef = useRef();
  ethRef.current = ethStore;
  const tezRef = useRef();
  tezRef.current = tezStore;

  const forceUpdate = React.useCallback(() => updateState({}), []);

  const initialize = async (ethKey, tezKey) => {
    try {
      const eth = setEthAccount(ethKey);
      const tez = await setTezAccount(tezKey);
      ethSetup(eth);
      tezSetup(tez);
    } catch {
      alert("Wrong keys");
    }
  };

  const update = (hash, state) => {
    let newSwap = swapRef.current;
    if (newSwap[hash] !== undefined) {
      newSwap[hash].state = state;
      updateSwaps(newSwap);
      forceUpdate();
    } else console.log("missing hash update request");
  };

  const genSwap = async (type, value, req_swap = undefined) => {
    let swap = {};
    if (type === 2) {
      if (req_swap === undefined) {
        swap = await requestTezos(
          value,
          ethRef.current,
          tezRef.current,
          update
        );
      } else {
        swap = await respondTezos(
          value,
          ethRef.current,
          tezRef.current,
          req_swap,
          update
        );
      }
    } else if (type === 1) {
      if (req_swap === undefined) {
        swap = await requestEth(value, ethRef.current, tezRef.current, update);
      } else {
        swap = await respondEth(
          value,
          ethRef.current,
          tezRef.current,
          req_swap,
          update
        );
      }
    }
    if (swap === undefined) return false;
    let newSwaps = swaps;
    if (newSwaps === undefined) {
      newSwaps = {};
    }
    newSwaps[swap.hashedSecret] = swap;
    updateSwaps(newSwaps);
    return true;
  };

  if (ethStore === undefined || tezStore === undefined)
    return (
      <div className="App">
        <Setup init={initialize} />
      </div>
    );

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <Header ethStore={ethStore} tezStore={tezStore} balUpdate={balUpdate} />
        {balance === undefined && <Loader message="Loading Account" />}
        {balance !== undefined && (
          <Switch>
            <Route exact path="/">
              <Home swaps={swaps} />
            </Route>
            <Route exact path="/create/eth">
              <Ethereum
                genSwap={genSwap}
                selfAcc={tezStore.keyStore.publicKeyHash}
                balance={balance.eth}
              />
            </Route>
            <Route exact path="/create/xtz">
              <Tezos
                genSwap={genSwap}
                ethStore={ethStore}
                balance={balance.tez}
              />
            </Route>
            <Route exact path="/create">
              <Swap />
            </Route>
            <Route exact path="/about">
              <About />
            </Route>
          </Switch>
        )}
      </div>
    </Router>
  );
};

export default App;
