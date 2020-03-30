const extractCurrencyValue = str => parseInt(`${str}`.slice(1));

console.log(extractCurrencyValue('$120'));