function shortenNum(num) {
  let result;

  if (num >= 1000000) {
    result = (Math.floor(num / 100000) / 10).toString() + "M";
    if (num > Math.floor(num / 100000) * 100) {
      result = "+" + result;
    }
    return result;
  }

  if (num >= 1000) {
    result = (Math.floor(num / 100) / 10).toString() + "K";
    if (num > Math.floor(num / 100) * 100) {
      result = "+" + result;
    }
    return result;
  }

  return num.toString();
}
