const ccxt = require("ccxt");

const selecionarExchange = (dados) => {
    switch (dados) {
        case "bitfinex":
            let bitfinex = new ccxt.bitfinex();
            return bitfinex;
        case "bittrex":
            let bittrex = new ccxt.bittrex();
            return bittrex;
        default:
            throw new Error("Exchange não implementado");
    }
};

module.exports = { selecionarExchange };
