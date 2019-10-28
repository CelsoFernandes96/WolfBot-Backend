const Order = require("../../models/orderModel");

const getTotalOrden = async (params) => {
    try {
        const orders = await Order.aggregate([
            {
                $group: { 
                    _id: "$status",
                    total: { $sum: 1 }
                }
        }]);

        return orders;
    } catch (error) {
        return error;
    }
};

const getOrderPerDay = async (params) => {
    try {
        const orders = await Order.aggregate([
            {
                $group: { 
                    _id: { $month: "$date"},
                    total: { $sum: 1 } 
                }
            },
            { $sort: { _id: 1 } },
        ]);

        return orders;
    } catch (error) {
        return error;
    }
};

const getProfitCloseBuy = async (params) => {
    try {
        const orders = await Order.aggregate([
            { $match: { status: 'close' } },
            { $match: { type_operation: 'buy' } },
            {
                $group: { 
                    _id: { $month: "$date"},
                    totalBuy: { $sum: { $multiply: [ "$cost"] } } 
                }
            },
            { $sort: { _id: 1 } },
        ]);

        return orders;
    } catch (error) {
        return error;
    }
};

const getProfitCloseSell = async (params) => {
    try {
        const orders = await Order.aggregate([
            { $match: { status: 'close' } },
            { $match: { type_operation: 'sell' } },
            {
                $group: { 
                    _id: { $month: "$date"},
                    totalSell: { $sum: { $multiply: [ "$cost"] } }
                }
            },
            { $sort: { _id: 1 } },
        ]);

        return orders;
    } catch (error) {
        return error;
    }
};

module.exports = {
    getTotalOrden,
    getOrderPerDay,
    getProfitCloseBuy,
    getProfitCloseSell
}