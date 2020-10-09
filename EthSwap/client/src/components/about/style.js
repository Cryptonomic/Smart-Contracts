import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "70%",
    margin: "-2vw auto",
    fontSize: "1.4vw",
    lineHeight: "2.8vw",
    marginBottom: "2.8vw",
  },
  list: { textAlign: "left", width: "fit-content", margin: "0 auto" },
}));

export default useStyles;
