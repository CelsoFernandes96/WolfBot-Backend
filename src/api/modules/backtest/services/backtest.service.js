const Backtest = require("../../../models/backtestModel");

const getBacktest = async (uid) => {
    try {
        const backtestResult = await Backtest.find({ user: uid });
        return backtestResult;
    } catch (error) {
        return error;
    }
};

module.exports = {
    getBacktest,
};
