const convertJSON = (obj) => {
  const str = JSON.stringify(obj);
  const temp = str
    .replace(" ", "")
    .replace(/\\"/g, '"')
    .replace(/[\n\t\r]/, "");
  return temp;
};

export default convertJSON;
