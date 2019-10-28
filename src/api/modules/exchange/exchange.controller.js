const serviceExchange = require("./exchange.service");

// # PRIVATE METHODS /
const fetchBalance = async (req, res) => {
    try {
        const { uid } = req.user;
        const saldo = await serviceExchange.fetchBalance(uid);
        res.status(200).json({
            saldo,
        });
    } catch (error) {
        res.status(400).json({
            message: error,
        });
    }
};

module.exports = {
    fetchBalance,
};
