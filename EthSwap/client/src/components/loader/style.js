import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  loader: {
    color: "black",
    fontSize: "2vw",
  },
  msg: { margin: "2vw", fontSize: "1.5vw" },
  container: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
}));

export default useStyles;
