const orderService = require("./orderService");

const buy = (req, res) => {
    try {
        const params = {
            user_uid: req.body.user_uid,
            amount: req.body.amount,
            price: req.body.price,
            type_operation: req.body.type_operation,
            symbol: req.body.symbol,
            type: req.body.type,
            action: req.body.action,
        };
        orderService.comprar(params, res);
    } catch (e) {
        res.status(400).json({
            message: e.message,
            status: "400",
        });
    }
};

const sell = (req, res) => {
    try {
        const params = {
            user_uid: req.body.user_uid,
            symbol: req.body.symbol,
            amount: req.body.amount,
            price: req.body.price,
            type_operation: req.body.type_operation,
            type: req.body.type,
            action: req.body.action,
        };
        orderService.vender(params, res);
    } catch (e) {
        res.status(400).json({
            message: e.message,
            status: "400",
        });
    }
};
const getOrdersCloseByUserManual = async (req, res) => {
    try {
        const { uid } = req.user;
        const ordersResult = await orderService.getOrdersCloseByUserManual(uid);
        res.status(200).json({
            ordersResult,
        });
    } catch (error) {
        res.status(400).json({
            error,
        });
    }
};

module.exports = {
    buy,
    sell,
    getOrdersCloseByUserManual,
};
