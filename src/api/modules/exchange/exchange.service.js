const ccxt = require("ccxt");
const Configuracao = require("../configuration/configuration.service");

const fetchBalance = async (uid) => {
    try {
        const config = await Configuracao.getConfiguration(uid);
        const nomeExchange = config.exchange.toLowerCase();
        const exchangeCCXT = new ccxt[nomeExchange]();
        exchangeCCXT.apiKey = config.api_key;
        exchangeCCXT.secret = config.secret;
        const balance = await exchangeCCXT.fetchBalance();
        return balance;
    } catch (error) {
        return error;
    }
};

const fetchTickers = async (exchange) => {
    try {
        const exchangeCCXT = new ccxt[exchange]();
        const tickers = await exchangeCCXT.fetchTickers();
        return tickers;
    } catch (error) {
        return error;
    }
};

module.exports = {
    fetchBalance,
    fetchTickers,
};
