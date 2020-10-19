import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import useStyles from "./style";

const Loader = ({ message }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <CircularProgress className={classes.loader} size={60} />
      <p className={classes.msg}>{message}</p>
    </div>
  );
};

export default Loader;
