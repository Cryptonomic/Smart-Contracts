import React, { useEffect, useState } from "react";
import getConversionRate from "../../../../library/common/getConversionRate";
import { useHistory } from "react-router-dom";
import useStyles from "../../style";

const CreateSwap = ({ className, genSwap, loader, balance }) => {
  const [rate, setRate] = useState(0);
  const [input, setInput] = useState(0);
  const history = useHistory();
  const classes = useStyles();
  useEffect(() => {
    getConversionRate().then((res) => {
      setRate(res);
    });
    console.log("Rate Updated");
    const timer = setInterval(async () => {
      const rt = await getConversionRate();
      setRate(rt);
    }, 600000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const generateSwap = async (e) => {
    e.preventDefault();
    if (e.target.eth.value === "" || e.target.eth.value === 0) return;
    loader(true);
    const res = await genSwap(1, e.target.eth.value);
    loader(false);
    if (!res) {
      alert("Error: Swap Couldn't be created");
    } else {
      history.push("/");
    }
  };
  return (
    <div className={className}>
      <div className={classes.createWrap}>
        <form onSubmit={generateSwap}>
          <input
            type="number"
            placeholder="Amount in ETH"
            name="eth"
            step=".0001"
            min="0"
            onInput={(e) => setInput(e.target.value)}
            className={classes.valueInput}
          />
          <input className={classes.create} type="submit" value="CREATE" />
        </form>
        <p className={classes.expectedValue}>
          Expected XTZ Value : {input * rate} XTZ
        </p>
      </div>
    </div>
  );
};

export default CreateSwap;
