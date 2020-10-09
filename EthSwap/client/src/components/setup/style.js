import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "31%",
    margin: "0 auto",
    padding: "2vw 3vw 1vw 3vw",
    border: "0.3vw black solid",
    borderRadius: "1vw",
  },
  input: { margin: "1vw", fontSize: "1.2vw" },
  submit: {
    color: "white",
    width: "fit-content",
    margin: "1vw auto",
    padding: "0.5vw",
    fontWeight: "bold",
    borderRadius: "0.3vw",
    backgroundColor: "black",
    cursor: "pointer",
    fontSize: "1.2vw",
    outline: "none",
    border: "0.2vw black solid",
    "&:hover": {
      backgroundColor: "white",
      color: "black",
    },
  },
  intro: {
    margin: "5vw",
    fontSize: "1.5vw",
  },
  title: {
    fontFamily: "'Pacifico', cursive",
    fontSize: "5vw",
    margin: "0",
  },
}));

export default useStyles;
