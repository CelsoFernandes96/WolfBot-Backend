/* eslint-disable prefer-destructuring */
const moment = require("moment");
const Order = require("../orders/orderService");
const Exchange = require("../exchange/exchange.service");
const Configuration = require("../configuration/configuration.service");

const dayResult = async (uid) => {
    try {
        const time = moment;
        time.locale("pt-br");
        const today = time().format("YYYY-MM-DD");
        let total = 0;
        const closeOrders = await Order.getOrdersSellCloseByUserManual(uid);
        closeOrders.filter((item) => {
            if (time(item.date).isSame(today, "day")) {
                total += item.cost;
            }
            return 0;
        });
        return total.toFixed(2);
    } catch (error) {
        return error;
    }
};

const overallResult = async (uid) => {
    try {
        const closeOrders = await Order.getOrdersSellCloseByUserManual(uid);
        let total = 0;
        closeOrders.map((item) => {
            total += item.cost;
            return 0;
        });
        return total.toFixed(2);
    } catch (error) {
        return error;
    }
};

const totalizerOpenOrdersAndClosedOrders = async (uid) => {
    try {
        const openOrders = await Order.getOrdersOpenByUserManual(uid);
        const closeOrders = await Order.getOrdersSellCloseByUserManual(uid);
        return {
            openOrders: openOrders.length,
            closeOrders: closeOrders.length,
        };
    } catch (error) {
        return error;
    }
};

const operationsSummary = async (uid) => {
    try {
        const openOrders = await Order.getOrdersBuyCloseByUserManual(uid);
        const closeOrders = await Order.getOrdersSellCloseByUserManual(uid);
        let totalInvested = 0;
        let investimentReturn = 0;
        openOrders.map((item) => {
            totalInvested += item.cost;
            return 0;
        });
        closeOrders.map((item) => {
            investimentReturn += item.cost;
            return 0;
        });
        const profit = (investimentReturn - totalInvested).toFixed(2);
        const profitPercentual = ((profit / totalInvested) * 100).toFixed(2);
        return {
            totalInvested: totalInvested.toFixed(2),
            investimentReturn: investimentReturn.toFixed(2),
            profit,
            profitPercentual,
        };
    } catch (error) {
        return error;
    }
};

const openOrdersTable = async (uid) => {
    try {
        const openOrders = await Order.getOrdersOpenByUserManual(uid);

        const arrayOpenOrders = openOrders.map((item) => {
            const dateOpen = moment(item.date);
            const timeActual = moment();
            return {
                currency: item.currency,
                amount: item.amount,
                cost: item.cost,
                timeOpen: timeActual.diff(dateOpen, "days"),
            };
        });
        return arrayOpenOrders;
    } catch (error) {
        return error;
    }
};
const totalAssets = async (uid) => {
    try {
        const config = await Configuration.getConfiguration(uid);
        const { exchange } = config;
        const balance = await Exchange.fetchBalance(uid);
        const objBalance = balance.total;
        let totalUSD = 0;
        const tickers = await Exchange.fetchTickers(exchange);
        Object.keys(objBalance).forEach((item) => {
            const pairCurrency = `${item}/USD`;
            const balanceItem = objBalance[item];
            if (pairCurrency !== "USD/USD") {
                const average = tickers[pairCurrency].average;
                totalUSD += average * balanceItem;
            }
            if (pairCurrency === "USD/USD") {
                totalUSD += balanceItem;
            }
        });
        return totalUSD.toFixed(2);
    } catch (error) {
        return error;
    }
};

module.exports = {
    dayResult,
    overallResult,
    totalizerOpenOrdersAndClosedOrders,
    operationsSummary,
    openOrdersTable,
    totalAssets,
};
