const backtestHart = require("./services/backtest.heart");
const backtestService = require("./services/backtest.service");

const testSetup = async (req, res) => {
    try {
        const { uid } = req.user;
        const params = {
            exchange: req.body.exchange,
            indicator: req.body.indicator,
            profit: req.body.profit,
            stop: req.body.stop,
            sellForIndicator: req.body.sellForIndicator,
            base_currency: req.body.base_currency,
            target_currency: req.body.target_currency,
            candle_size: req.body.candle_size,
            quantity: req.body.quantity,
            date: req.body.date,
            user: uid,
        };

        const backtestResult = await backtestHart.loadTest(params);
        res.status(200).json({
            backtestResult,
        });
    } catch (error) {
        res.status(400).json({
            error,
        });
    }
};

const getBacktest = async (req, res) => {
    try {
        const { uid } = req.user;
        const backtestResult = await backtestService.getBacktest(uid);
        res.status(200).json({
            backtestResult,
        });
    } catch (error) {
        res.status(400).json({
            error,
        });
    }
};

module.exports = {
    testSetup,
    getBacktest,
};
