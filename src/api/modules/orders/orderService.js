/* eslint-disable no-underscore-dangle */
const ccxt = require("ccxt");
const moment = require("moment");
const _ = require("lodash");
const Order = require("../../models/orderModel");

// ###################### FUNÇÕES UTILIZADAS PELO BOT ##########################
const getOrdersOpenByCurrency = async (params) => {
    try {
        const orders = await Order.find({
            user: params.user_uid,
            currency: params.currency,
            status: "open",
        });
        return orders;
    } catch (error) {
        return error;
    }
};

const getOrdersOpenByUser = async (params) => {
    try {
        const orders = await Order.find({
            user: params.user_uid,
            status: "open",
        });
        return orders;
    } catch (error) {
        return error;
    }
};

const orderBuy = async (config, params) => {
    try {
        const time = moment;
        time.locale("pt-br");
        const nomeExchange = config.exchange.toLowerCase();
        const exchangeCCXT = new ccxt[nomeExchange]();
        exchangeCCXT.apiKey = config.api_key;
        exchangeCCXT.secret = config.secret;
        const pairCurrency = `${params.target_currency}/${config.base_currency}`;
        const bids = await exchangeCCXT.fetchOrderBook(pairCurrency); // busco orderbook de preços
        const price = _.first(bids.asks); // pego o melhor preço de compra
        const amount = config.purchase_quantity / price[0]; // acho a quantidade que vou comprar
        const totalBalance = await exchangeCCXT.fetchBalance(); // vejo se tenho saldo na moeda base
        const balance = 1000; // totalBalance[config.base_currency]; // filtro saldo da moeda base
        const purchaseValue = config.purchase_quantity + config.purchase_quantity * (0.25 / 100);
        let openOrderBuyExchange = {};

        // amount <= balance.free
        if (purchaseValue <= balance) {
            /* openOrderBuyExchange = await exchangeCCXT.createLimitBuyOrder(
                pairCurrency, // Simbolo do par de moedas a ser comprado
                Number.parseFloat(amount.toFixed(8)), // Montante a ser comprado
                Number.parseFloat(price[0]) // Preço da moeda que será comprada
            ); */
            const orderMongo = {
                date: time().format(),
                amount: amount.toFixed(8),
                price: price[0],
                cost: purchaseValue,
                currency: params.target_currency,
                type_operation: "buy",
                action: params.action,
                user: config.user_uid,
                identifier: Date.now().toString(), // openOrderBuyExchange.id,
                status: "open",
            };
            const resultOrderBuy = await Order.create(orderMongo);
            return resultOrderBuy;
        }
        return 0;
    } catch (error) {
        return error;
    }
};

const orderSell = async (config, params, orderBuyMongo) => {
    try {
        const time = moment;
        time.locale("pt-br");
        const nomeExchange = config.exchange.toLowerCase();
        const exchangeCCXT = new ccxt[nomeExchange]();
        exchangeCCXT.apiKey = config.api_key;
        exchangeCCXT.secret = config.secret;
        const pairCurrency = `${params.target_currency}/${config.base_currency}`;
        const bids = await exchangeCCXT.fetchOrderBook(pairCurrency); // busco orderbook de preços
        const price = _.first(bids.bids); // pego o melhor preço de venda
        const amount = Number.parseFloat(orderBuyMongo.amount); // acho a quantidade que vou vender
        const totalBalance = await exchangeCCXT.fetchBalance(); // vejo se tenho saldo na moeda alvo
        const balance = orderBuyMongo.amount; // totalBalance[params.target_currency]; // filtro saldo da moeda alvo
        const cost = Number.parseFloat(price[0]) * amount;
        let openOrderSellExchange = {};

        // amount <= balance.free
        if (amount <= balance && orderBuyMongo.status !== "close") {
            /* openOrderSellExchange = await exchangeCCXT.createLimitSellOrder(
                pairCurrency, // Simbolo do par de moedas a ser vendido
                amount, // Montante a ser vendido
                Number.parseFloat(price[0]) // Preço da moeda que será vendida
            ); */
            const orderMongo = {
                date: time().format(),
                amount: amount.toFixed(8),
                price: price[0],
                cost: cost - cost * (0.25 / 100), // aplico a taxa da exchange na venda
                currency: params.target_currency,
                type_operation: "sell",
                action: params.action,
                user: config.user_uid,
                identifier: Date.now().toString(), // openOrderSellExchange.id,
                status: "close",
            };
            const resultOrderSell = await Order.create(orderMongo);
            await Order.update({ _id: orderBuyMongo._id }, { status: "close" });
            return resultOrderSell;
        }
        return 0;
    } catch (error) {
        return error;
    }
};

// ###################### FUNÇÕES UTILIZADAS MANUALMENTE ##########################
const getOrdersOpenByUserManual = async (uid) => {
    try {
        const orders = await Order.find({
            user: uid,
            status: "open",
        });
        return orders;
    } catch (error) {
        return error;
    }
};
const getOrdersCloseByUserManual = async (uid) => {
    try {
        const orders = await Order.find({
            user: uid,
            status: "close",
        });
        return orders;
    } catch (error) {
        return error;
    }
};
const getOrdersBuyCloseByUserManual = async (uid) => {
    try {
        const orders = await Order.find({
            user: uid,
            status: "close",
            type_operation: "buy",
        });
        return orders;
    } catch (error) {
        return error;
    }
};

const getOrdersSellCloseByUserManual = async (uid) => {
    try {
        const orders = await Order.find({
            user: uid,
            status: "close",
            type_operation: "sell",
        });
        return orders;
    } catch (error) {
        return error;
    }
};

module.exports = {
    getOrdersOpenByCurrency,
    orderBuy,
    orderSell,
    getOrdersOpenByUser,
    getOrdersOpenByUserManual,
    getOrdersSellCloseByUserManual,
    getOrdersBuyCloseByUserManual,
    getOrdersCloseByUserManual,
};
