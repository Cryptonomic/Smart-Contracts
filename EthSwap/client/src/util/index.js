exports.shorten = (first, last, str) => {
  return str.substring(0, first) + "..." + str.substring(str.length - last);
};

exports.truncate = (number, digits) => {
  return Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits);
};
