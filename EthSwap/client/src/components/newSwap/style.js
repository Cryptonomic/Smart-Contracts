import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  select: {
    width: "90%",
    margin: "0 auto",
    display: "flex",
    height: "100%",
    justifyContent: "center",
  },
  selectButton: {
    margin: "1.5vw",
    padding: "4vw",
    backgroundColor: "black",
    borderRadius: "0.6vw",
    color: "white",
    fontSize: "2.5vw",
    fontWeight: "bold",
    cursor: "pointer",
    border: "0.2vw solid black",
    width: "100%",
    outline: "none",
    "&:hover": {
      backgroundColor: "white",
      color: "black",
    },
  },
  expectedValue: {
    display: "block",
    marginTop: "2vw",
  },
  create: {
    backgroundColor: "black",
    borderRadius: "0.5vw",
    color: "white",
    fontWeight: "bold",
    padding: "0.4vw 1vw",
    cursor: "pointer",
    outline: "none",
    border: "0.2vw black solid",
    "&:hover": {
      backgroundColor: "white",
      color: "black",
    },
  },
  valueInput: {
    padding: "0.7vw",
    margin: "1vw auto",
    display: "block",
    width: "17vw",
    height: "1.4vw",
    fontSize: "1vw",
  },
  swap: {
    color: "white",
    border: "0.2vw black solid",
    cursor: "pointer",
    margin: "0 1.4vw 1.4vw 1.4vw",
    outline: "none",
    padding: "0.7vw",
    lineHeight: "1vw",
    borderRadius: "1vw",
    backgroundColor: "black",
    fontSize: "1.5vw",
    "&:hover": {
      backgroundColor: "white",
      color: "black",
    },
  },
  msg: {
    margin: "1.4vw 1vw",
    fontSize: "1.7vw",
  },
  swapScreen: {
    display: "flex",
    justifyContent: "center",
    height: "100%",
  },
  swaps: {
    flexGrow: 1,
    overflowY: "auto",
  },
  or: {
    display: "flex",
    flexGrow: "1",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "2.5vw",
    background: "linear-gradient(#000, #000) no-repeat center/2px 100%",
    "& p": {
      background: "white",
    },
  },
  newSwap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    flexGrow: 1,
  },
  createWrap: {
    width: "28vw",
    padding: "2vw",
    border: "0.3vw solid black",
    borderRadius: "1vw",
  },
  container: {
    width: "45%",
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
}));

export default useStyles;
