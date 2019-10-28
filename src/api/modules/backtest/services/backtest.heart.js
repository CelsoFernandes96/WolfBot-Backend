const ccxt = require("ccxt");
const moment = require("moment");
const strategy = require("./backtest.strategies");

const loadTest = async (params) => {
    try {
        const exchangeCCXT = new ccxt[params.exchange]();
        exchangeCCXT.enableRateLimit = true;
        await exchangeCCXT.loadMarkets();
        const pairCurrency = `${params.target_currency}/${params.base_currency}`;
        const market = exchangeCCXT.markets[pairCurrency];
        const candleSize = params.candle_size;
        const configIndicators = params;
        const time = moment(params.date);

        const candle = await exchangeCCXT.fetchOHLCV(pairCurrency, candleSize, time.format("x"));
        const result = await strategy.loadStrategy(configIndicators, candle, market);

        return result;
    } catch (error) {
        return error;
    }
};

module.exports = {
    loadTest,
};
