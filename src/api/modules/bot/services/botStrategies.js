/* eslint-disable max-depth */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable max-statements */
/* eslint-disable max-params */
const _ = require("lodash");
const chalk = require("chalk");
const tulind = require("tulind");
const moment = require("moment");
const Order = require("../../orders/orderService");
const emitMessage = require("../../../utils/functions/emitMessage");
const LogModel = require("../../../models/logModel");

const loadStrategy = async (config, params, target_currency, candle, ordersOpen, user) => {
    const digits = 4;
    const { sellForIndicator, profit, stop, maxOrdersOpen } = config;
    const timestamp = [];
    const open = [];
    const high = [];
    const low = [];
    const close = [];
    const volume = [];
    const signal = [];
    const status_BUY = params.status_buy;
    const status_SELL = params.status_sell;
    const params_order = {
        target_currency: target_currency,
        action: "Automatic",
    };

    _.flatten(
        candle.map((value) =>
            value.filter((value2, index2) => {
                if (index2 === 0) {
                    timestamp.push(value2);
                }
                if (index2 === 1) {
                    open.push(value2);
                }
                if (index2 === 2) {
                    high.push(value2);
                }
                if (index2 === 3) {
                    low.push(value2);
                }
                if (index2 === 4) {
                    close.push(value2);
                }
                if (index2 === 5) {
                    volume.push(value2);
                }
            })
        )
    );

    const price = parseFloat(close.slice(-1));
    const previousPrice = parseFloat(close.slice(-2));
    const time = moment().set(timestamp.slice(-1));
    time.locale("pt-br");

    // ############################### INDICADOR EMA ################################
    if (config.strategy.indicators.ema.status) {
        const short = config.strategy.indicators.ema.short_period;
        const long = config.strategy.indicators.ema.long_period;
        let short_ema = 0;
        let long_ema = 0;
        tulind.indicators.ema.indicator([close], [short], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                short_ema = parseFloat(result[0].slice(-1));
            }
        });
        tulind.indicators.ema.indicator([close], [long], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                long_ema = parseFloat(result[0].slice(-1));
            }
        });
        const trend = {
            persistence: 1,
        };
        console.log(chalk.cyan("########## Resultado EMA ##########"));
        console.log(chalk.cyan(`moeda: ${target_currency}`));
        console.log(
            chalk.magenta(`Preço = ${price.toFixed(8)} - ${time.format("DD-MM-YYYY HH:mm:ss")}`)
        );
        console.log(chalk.magenta(`Preço Anterior = ${previousPrice.toFixed(8)}`));
        console.log(chalk.magenta(`linha SHORT EMA = ${short_ema.toFixed(digits)}`));
        console.log(chalk.magenta(`linha LONG EMA = ${long_ema.toFixed(digits)}`));

        // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
        const trend_UP = long_ema + trend.persistence;
        const trend_DOWN = long_ema - trend.persistence;

        if (short_ema > long_ema) {
            if (short_ema < trend_UP && price >= previousPrice) {
                console.log(chalk.red("SINAL DE COMPRA!"));
                await emitMessage(
                    {
                        logs: {
                            logAction: "Sinal de Compra",
                            logEvent: "Resultado EMA",
                            logMoeda: target_currency,
                            logPrice: price.toFixed(8),
                            previousPrice: previousPrice.toFixed(8),
                            logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                            logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                        },
                    },
                    user
                );
                await new LogModel({
                    logAction: "Sinal de Compra",
                    logEvent: "Resultado EMA",
                    logMoeda: `${target_currency}`,
                    logPrice: `${price.toFixed(8)}`,
                    previousPrice: `${previousPrice.toFixed(8)}`,
                    logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                    logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                    user,
                }).save();
                signal.push({
                    indicator: "EMA",
                    buy: true,
                    sell: false,
                });
            } else {
                console.log(chalk.yellow("NEUTRO"));
                await emitMessage(
                    {
                        logs: {
                            logAction: "Neutro",
                            logEvent: "Resultado EMA",
                            logMoeda: target_currency,
                            logPrice: price.toFixed(8),
                            previousPrice: previousPrice.toFixed(8),
                            logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                            logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                        },
                    },
                    user
                );
                await new LogModel({
                    logAction: "Neutro",
                    logEvent: "Resultado EMA",
                    logMoeda: `${target_currency}`,
                    logPrice: `${price.toFixed(8)}`,
                    previousPrice: `${previousPrice.toFixed(8)}`,
                    logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                    logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                    user,
                }).save();
                signal.push({
                    indicator: "EMA",
                    buy: false,
                    sell: false,
                });
            }
        } else if (sellForIndicator === true) {
            if (short_ema < long_ema) {
                if (short_ema > trend_DOWN && price <= previousPrice) {
                    console.log(chalk.green("SINAL DE VENDA"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Sinal de Venda",
                                logEvent: "Resultado EMA",
                                logMoeda: target_currency,
                                logPrice: price.toFixed(8),
                                previousPrice: previousPrice.toFixed(8),
                                logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                                logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Sinal de Venda",
                        logEvent: "Resultado EMA",
                        logMoeda: `${target_currency}`,
                        logPrice: `${price.toFixed(8)}`,
                        previousPrice: `${previousPrice.toFixed(8)}`,
                        logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                        logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                    signal.push({
                        indicator: "EMA",
                        buy: false,
                        sell: true,
                    });
                } else {
                    console.log(chalk.yellow("NEUTRO"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Neutro",
                                logEvent: "Resultado EMA",
                                logMoeda: target_currency,
                                logPrice: price.toFixed(8),
                                previousPrice: previousPrice.toFixed(8),
                                logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                                logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Neutro",
                        logEvent: "Resultado EMA",
                        logMoeda: `${target_currency}`,
                        logPrice: `${price.toFixed(8)}`,
                        previousPrice: `${previousPrice.toFixed(8)}`,
                        logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                        logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                    signal.push({
                        indicator: "EMA",
                        buy: false,
                        sell: false,
                    });
                }
            }
        } else {
            console.log(chalk.yellow("NEUTRO"));
            await emitMessage(
                {
                    logs: {
                        logAction: "Neutro",
                        logEvent: "Resultado EMA",
                        logMoeda: target_currency,
                        logPrice: price.toFixed(8),
                        previousPrice: previousPrice.toFixed(8),
                        logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                        logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                    },
                },
                user
            );
            await new LogModel({
                logAction: "Neutro",
                logEvent: "Resultado EMA",
                logMoeda: `${target_currency}`,
                logPrice: `${price.toFixed(8)}`,
                previousPrice: `${previousPrice.toFixed(8)}`,
                logInfoOne: `Linha SHORT EMA = ${short_ema.toFixed(digits)}`,
                logInfoTwo: `Linha LONG EMA = ${long_ema.toFixed(digits)}`,
                date: time.format("DD-MM-YYYY HH:mm:ss"),
                user,
            }).save();
            signal.push({
                indicator: "EMA",
                buy: false,
                sell: false,
            });
        }
    }

    // ############################### INDICADOR MACD ################################
    if (config.strategy.indicators.macd.status) {
        const shortPeriod = config.strategy.indicators.macd.short_period;
        const longPeriod = config.strategy.indicators.macd.long_period;
        const signalPeriod = config.strategy.indicators.macd.signal_period;

        tulind.indicators.macd.indicator(
            [close],
            [shortPeriod, longPeriod, signalPeriod],
            async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const trend = {
                        up: 0.025,
                        down: 0.025,
                        persistence: 1,
                    };
                    const macd = parseFloat(result[0].slice(-1));
                    const signal_macd = parseFloat(result[1].slice(-1));
                    const histogram = parseFloat(result[2].slice(-1));

                    console.log(chalk.cyan("########## Resultado MACD ##########"));
                    console.log(chalk.cyan(`moeda: ${target_currency}`));
                    console.log(
                        chalk.magenta(
                            `Preço = ${price.toFixed(8)} - ${time.format("DD-MM-YYYY HH:mm:ss")}`
                        )
                    );
                    console.log(chalk.magenta(`Preço Anterior = ${previousPrice.toFixed(8)}`));
                    console.log(chalk.magenta(`linha MACD = ${macd.toFixed(digits)}`));
                    console.log(chalk.magenta(`linha Sinal = ${signal_macd.toFixed(digits)}`));
                    console.log(chalk.magenta(`Histograma = ${histogram.toFixed(digits)}`));

                    // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                    if (macd < 0) {
                        if (
                            histogram > trend.up &&
                            histogram < trend.up + trend.persistence &&
                            price >= previousPrice
                        ) {
                            console.log(chalk.red("SINAL DE COMPRA!"));
                            await emitMessage(
                                {
                                    logs: {
                                        logAction: "Sinal de Compra",
                                        logEvent: "Resultado MACD",
                                        logMoeda: target_currency,
                                        logPrice: price.toFixed(8),
                                        previousPrice: previousPrice.toFixed(8),
                                        logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                        logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                                        logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    },
                                },
                                user
                            );
                            await new LogModel({
                                logAction: "Sinal de Compra",
                                logEvent: "Resultado MACD",
                                logMoeda: `${target_currency}`,
                                logPrice: `${price.toFixed(8)}`,
                                previousPrice: `${previousPrice.toFixed(8)}`,
                                logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                                logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                                user,
                            }).save();
                            signal.push({
                                indicator: "MACD",
                                buy: true,
                                sell: false,
                            });
                        } else {
                            console.log(chalk.yellow("NEUTRO"));
                            await emitMessage(
                                {
                                    logs: {
                                        logAction: "Neutro",
                                        logEvent: "Resultado MACD",
                                        logMoeda: target_currency,
                                        logPrice: price.toFixed(8),
                                        previousPrice: previousPrice.toFixed(8),
                                        logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                        logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                                        logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    },
                                },
                                user
                            );
                            await new LogModel({
                                logAction: "Neutro",
                                logEvent: "Resultado MACD",
                                logMoeda: `${target_currency}`,
                                logPrice: `${price.toFixed(8)}`,
                                previousPrice: `${previousPrice.toFixed(8)}`,
                                logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                                logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                                user,
                            }).save();
                            signal.push({
                                indicator: "MACD",
                                buy: false,
                                sell: false,
                            });
                        }
                    } else if (sellForIndicator === true) {
                        if (macd > 0) {
                            if (
                                histogram < trend.down &&
                                histogram > trend.down - trend.persistence &&
                                price <= previousPrice
                            ) {
                                console.log(chalk.green("SINAL DE VENDA"));
                                await emitMessage(
                                    {
                                        logs: {
                                            logAction: "Sinal de Venda",
                                            logEvent: "Resultado MACD",
                                            logMoeda: target_currency,
                                            logPrice: price.toFixed(8),
                                            previousPrice: previousPrice.toFixed(8),
                                            logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                            logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(
                                                digits
                                            )}`,
                                            logInfoThree: `Histograma = ${histogram.toFixed(
                                                digits
                                            )}`,
                                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                                        },
                                    },
                                    user
                                );
                                await new LogModel({
                                    logAction: "Sinal de Venda",
                                    logEvent: "Resultado MACD",
                                    logMoeda: `${target_currency}`,
                                    logPrice: `${price.toFixed(8)}`,
                                    previousPrice: `${previousPrice.toFixed(8)}`,
                                    logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                    logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                                    logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    user,
                                }).save();
                                signal.push({
                                    indicator: "MACD",
                                    buy: false,
                                    sell: true,
                                });
                            } else {
                                console.log(chalk.yellow("NEUTRO"));
                                await emitMessage(
                                    {
                                        logs: {
                                            logAction: "Neutro",
                                            logEvent: "Resultado MACD",
                                            logMoeda: target_currency,
                                            logPrice: price.toFixed(8),
                                            previousPrice: previousPrice.toFixed(8),
                                            logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                            logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(
                                                digits
                                            )}`,
                                            logInfoThree: `Histograma = ${histogram.toFixed(
                                                digits
                                            )}`,
                                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                                        },
                                    },
                                    user
                                );
                                await new LogModel({
                                    logAction: "Neutro",
                                    logEvent: "Resultado MACD",
                                    logMoeda: `${target_currency}`,
                                    logPrice: `${price.toFixed(8)}`,
                                    previousPrice: `${previousPrice.toFixed(8)}`,
                                    logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                    logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                                    logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    user,
                                }).save();
                                signal.push({
                                    indicator: "MACD",
                                    buy: false,
                                    sell: false,
                                });
                            }
                        }
                    } else {
                        console.log(chalk.yellow("NEUTRO"));
                        await emitMessage(
                            {
                                logs: {
                                    logAction: "Neutro",
                                    logEvent: "Resultado MACD",
                                    logMoeda: target_currency,
                                    logPrice: price.toFixed(8),
                                    previousPrice: previousPrice.toFixed(8),
                                    logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                                    logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                                    logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                },
                            },
                            user
                        );
                        await new LogModel({
                            logAction: "Neutro",
                            logEvent: "Resultado MACD",
                            logMoeda: `${target_currency}`,
                            logPrice: `${price.toFixed(8)}`,
                            previousPrice: `${previousPrice.toFixed(8)}`,
                            logInfoOne: `Linha MACD = ${macd.toFixed(digits)}`,
                            logInfoTwo: `Linha Sinal = ${signal_macd.toFixed(digits)}`,
                            logInfoThree: `Histograma = ${histogram.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                            user,
                        }).save();
                        signal.push({
                            indicator: "MACD",
                            buy: false,
                            sell: false,
                        });
                    }
                }
            }
        );
    }

    // ############################### INDICADOR STOCH ################################
    if (config.strategy.indicators.stoch.status) {
        const { k_period, k_slow_period, d_period } = config.strategy.indicators.stoch;
        tulind.indicators.stoch.indicator(
            [high, low, close],
            [k_period, k_slow_period, d_period],
            async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const trend = {
                        up: 0.025,
                        down: 0.025,
                        persistence: 1,
                    };
                    const k = parseFloat(result[0].slice(-1));
                    const d = parseFloat(result[1].slice(-1));

                    console.log(chalk.cyan("########## Resultado STOCH ##########"));
                    console.log(chalk.cyan(`moeda: ${target_currency}`));
                    console.log(
                        chalk.magenta(
                            `Preço = ${price.toFixed(8)} - ${time.format("DD-MM-YYYY HH:mm:ss")}`
                        )
                    );
                    console.log(chalk.magenta(`Preço Anterior = ${previousPrice.toFixed(8)}`));
                    console.log(chalk.magenta(`linha K = ${k.toFixed(digits)}`));
                    console.log(chalk.magenta(`linha D = ${d.toFixed(digits)}`));

                    // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                    if (k > 20) {
                        if (k > d && k < trend.up + 20 && price >= previousPrice) {
                            console.log(chalk.red("SINAL DE COMPRA!"));
                            await emitMessage(
                                {
                                    logs: {
                                        logAction: "Sinal de Compra",
                                        logEvent: "Resultado STOCH",
                                        logMoeda: target_currency,
                                        logPrice: price.toFixed(8),
                                        previousPrice: previousPrice.toFixed(8),
                                        logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                        logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    },
                                },
                                user
                            );
                            await new LogModel({
                                logAction: "Sinal de Compra",
                                logEvent: "Resultado STOCH",
                                logMoeda: `${target_currency}`,
                                logPrice: `${price.toFixed(8)}`,
                                previousPrice: `${previousPrice.toFixed(8)}`,
                                logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                                user,
                            }).save();
                            signal.push({
                                indicator: "STOCH",
                                buy: true,
                                sell: false,
                            });
                        } else {
                            console.log(chalk.yellow("NEUTRO"));
                            await emitMessage(
                                {
                                    logs: {
                                        logAction: "Neutro",
                                        logEvent: "Resultado STOCH",
                                        logMoeda: target_currency,
                                        logPrice: price.toFixed(8),
                                        previousPrice: previousPrice.toFixed(8),
                                        logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                        logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    },
                                },
                                user
                            );
                            await new LogModel({
                                logAction: "Neutro",
                                logEvent: "Resultado STOCH",
                                logMoeda: `${target_currency}`,
                                logPrice: `${price.toFixed(8)}`,
                                previousPrice: `${previousPrice.toFixed(8)}`,
                                logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                                user,
                            }).save();
                            signal.push({
                                indicator: "STOCH",
                                buy: false,
                                sell: false,
                            });
                        }
                    } else if (sellForIndicator === true) {
                        if (k < 80) {
                            if (k < d && k > 80 - trend.down && price <= previousPrice) {
                                console.log(chalk.green("SINAL DE VENDA"));
                                await emitMessage(
                                    {
                                        logs: {
                                            logAction: "Sinal de Venda",
                                            logEvent: "Resultado STOCH",
                                            logMoeda: target_currency,
                                            logPrice: price.toFixed(8),
                                            previousPrice: previousPrice.toFixed(8),
                                            logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                            logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                                        },
                                    },
                                    user
                                );
                                await new LogModel({
                                    logAction: "Sinal de Venda",
                                    logEvent: "Resultado STOCH",
                                    logMoeda: `${target_currency}`,
                                    logPrice: `${price.toFixed(8)}`,
                                    previousPrice: `${previousPrice.toFixed(8)}`,
                                    logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                    logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    user,
                                }).save();
                                signal.push({
                                    indicator: "STOCH",
                                    buy: false,
                                    sell: true,
                                });
                            } else {
                                console.log(chalk.yellow("NEUTRO"));
                                await emitMessage(
                                    {
                                        logs: {
                                            logAction: "Neutro",
                                            logEvent: "Resultado STOCH",
                                            logMoeda: target_currency,
                                            logPrice: price.toFixed(8),
                                            previousPrice: previousPrice.toFixed(8),
                                            logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                            logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                                        },
                                    },
                                    user
                                );
                                await new LogModel({
                                    logAction: "Neutro",
                                    logEvent: "Resultado STOCH",
                                    logMoeda: `${target_currency}`,
                                    logPrice: `${price.toFixed(8)}`,
                                    previousPrice: `${previousPrice.toFixed(8)}`,
                                    logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                    logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                    user,
                                }).save();
                                signal.push({
                                    indicator: "STOCH",
                                    buy: false,
                                    sell: false,
                                });
                            }
                        }
                    } else {
                        console.log(chalk.yellow("NEUTRO"));
                        await emitMessage(
                            {
                                logs: {
                                    logAction: "Neutro",
                                    logEvent: "Resultado STOCH",
                                    logMoeda: target_currency,
                                    logPrice: price.toFixed(8),
                                    previousPrice: previousPrice.toFixed(8),
                                    logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                                    logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                },
                            },
                            user
                        );
                        await new LogModel({
                            logAction: "Neutro",
                            logEvent: "Resultado STOCH",
                            logMoeda: `${target_currency}`,
                            logPrice: `${price.toFixed(8)}`,
                            previousPrice: `${previousPrice.toFixed(8)}`,
                            logInfoOne: `Linha K = ${k.toFixed(digits)}`,
                            logInfoTwo: `Linha D = ${d.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                            user,
                        }).save();
                        signal.push({
                            indicator: "STOCH",
                            buy: false,
                            sell: false,
                        });
                    }
                }
            }
        );
    }

    // ############################### INDICADOR CCI ################################
    if (config.strategy.indicators.cci.status) {
        const { period } = config.strategy.indicators.cci;
        tulind.indicators.cci.indicator([high, low, close], [period], async (err, result) => {
            if (err) {
                console.log(err);
            } else {
                const trend = {
                    up: 0.025,
                    down: 0.025,
                    persistence: 1,
                };
                const cci = parseFloat(result[0].slice(-1));

                console.log(chalk.cyan("########## Resultado CCI ##########"));
                console.log(chalk.cyan(`moeda: ${target_currency}`));
                console.log(
                    chalk.magenta(
                        `Preço = ${price.toFixed(8)} - ${time.format("DD-MM-YYYY HH:mm:ss")}`
                    )
                );
                console.log(chalk.magenta(`Preço Anterior = ${previousPrice.toFixed(8)}`));
                console.log(chalk.magenta(`linha K = ${cci.toFixed(digits)}`));

                // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                if (
                    cci > 100 &&
                    cci < trend.up + 100 + trend.persistence &&
                    price >= previousPrice
                ) {
                    console.log(chalk.red("SINAL DE COMPRA!"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Sinal de Compra",
                                logEvent: "Resultado CCI",
                                logMoeda: target_currency,
                                logPrice: price.toFixed(8),
                                previousPrice: previousPrice.toFixed(8),
                                logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Sinal de Compra",
                        logEvent: "Resultado CCI",
                        logMoeda: `${target_currency}`,
                        logPrice: `${price.toFixed(8)}`,
                        previousPrice: `${previousPrice.toFixed(8)}`,
                        logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                    signal.push({
                        indicator: "CCI",
                        buy: true,
                        sell: false,
                    });
                } else if (sellForIndicator === true) {
                    if (
                        cci < -100 &&
                        cci > trend.up - 100 - trend.persistence &&
                        price <= previousPrice
                    ) {
                        console.log(chalk.green("SINAL DE VENDA"));
                        await emitMessage(
                            {
                                logs: {
                                    logAction: "Sinal de Venda",
                                    logEvent: "Resultado CCI",
                                    logMoeda: target_currency,
                                    logPrice: price.toFixed(8),
                                    previousPrice: previousPrice.toFixed(8),
                                    logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                },
                            },
                            user
                        );
                        await new LogModel({
                            logAction: "Sinal de Venda",
                            logEvent: "Resultado CCI",
                            logMoeda: `${target_currency}`,
                            logPrice: `${price.toFixed(8)}`,
                            previousPrice: `${previousPrice.toFixed(8)}`,
                            logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                            user,
                        }).save();
                        signal.push({
                            indicator: "CCI",
                            buy: false,
                            sell: true,
                        });
                    } else {
                        console.log(chalk.yellow("NEUTRO"));
                        await emitMessage(
                            {
                                logs: {
                                    logAction: "Neutro",
                                    logEvent: "Resultado CCI",
                                    logMoeda: target_currency,
                                    logPrice: price.toFixed(8),
                                    previousPrice: previousPrice.toFixed(8),
                                    logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                },
                            },
                            user
                        );
                        await new LogModel({
                            logAction: "Neutro",
                            logEvent: "Resultado CCI",
                            logMoeda: `${target_currency}`,
                            logPrice: `${price.toFixed(8)}`,
                            previousPrice: `${previousPrice.toFixed(8)}`,
                            logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                            user,
                        }).save();
                        signal.push({
                            indicator: "CCI",
                            buy: false,
                            sell: false,
                        });
                    }
                } else {
                    console.log(chalk.yellow("NEUTRO"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Neutro",
                                logEvent: "Resultado CCI",
                                logMoeda: target_currency,
                                logPrice: price.toFixed(8),
                                previousPrice: previousPrice.toFixed(8),
                                logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Neutro",
                        logEvent: "Resultado CCI",
                        logMoeda: `${target_currency}`,
                        logPrice: `${price.toFixed(8)}`,
                        previousPrice: `${previousPrice.toFixed(8)}`,
                        logInfoOne: `Linha K = ${cci.toFixed(digits)}`,
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                    signal.push({
                        indicator: "CCI",
                        buy: false,
                        sell: false,
                    });
                }
            }
        });
    }

    // ############################### INDICADOR BBANDS ################################
    if (config.strategy.indicators.bbands.status) {
        const { period, stddev } = config.strategy.indicators.bbands;
        tulind.indicators.bbands.indicator([close], [period, stddev], async (err, result) => {
            if (err) {
                console.log(err);
            } else {
                const trend = {
                    up: 0.025,
                    down: 0.025,
                    persistence: 1,
                };
                const lower = parseFloat(result[0].slice(-1));
                const middle = parseFloat(result[1].slice(-1));
                const upper = parseFloat(result[2].slice(-1));

                console.log(chalk.cyan("########## Resultado BBANDS ##########"));
                console.log(chalk.cyan(`moeda: ${target_currency}`));
                console.log(
                    chalk.magenta(
                        `Preço = ${price.toFixed(8)} - ${time.format("DD-MM-YYYY HH:mm:ss")}`
                    )
                );
                console.log(chalk.magenta(`Preço Anterior = ${previousPrice.toFixed(8)}`));
                console.log(chalk.magenta(`linha lower = ${lower.toFixed(digits)}`));
                console.log(chalk.magenta(`linha middle = ${middle.toFixed(digits)}`));
                console.log(chalk.magenta(`linha upper = ${upper.toFixed(digits)}`));

                // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                if (price <= lower && price > lower - trend.down && price >= previousPrice) {
                    console.log(chalk.red("SINAL DE COMPRA!"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Sinal de Compra",
                                logEvent: "Resultado BBANDS",
                                logMoeda: target_currency,
                                logPrice: price.toFixed(8),
                                previousPrice: previousPrice.toFixed(8),
                                logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                                logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                                logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Sinal de Compra",
                        logEvent: "Resultado BBANDS",
                        logMoeda: `${target_currency}`,
                        logPrice: `${price.toFixed(8)}`,
                        previousPrice: `${previousPrice.toFixed(8)}`,
                        logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                        logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                        logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                    signal.push({
                        indicator: "BBANDS",
                        buy: true,
                        sell: false,
                    });
                } else if (sellForIndicator === true) {
                    if (price >= upper && price < upper + trend.up && price <= previousPrice) {
                        console.log(chalk.green("SINAL DE VENDA"));
                        await emitMessage(
                            {
                                logs: {
                                    logAction: "Sinal de Venda",
                                    logEvent: "Resultado BBANDS",
                                    logMoeda: target_currency,
                                    logPrice: price.toFixed(8),
                                    previousPrice: previousPrice.toFixed(8),
                                    logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                                    logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                                    logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                },
                            },
                            user
                        );
                        await new LogModel({
                            logAction: "Sinal de Venda",
                            logEvent: "Resultado BBANDS",
                            logMoeda: `${target_currency}`,
                            logPrice: `${price.toFixed(8)}`,
                            previousPrice: `${previousPrice.toFixed(8)}`,
                            logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                            logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                            logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                            user,
                        }).save();
                        signal.push({
                            indicator: "BBANDS",
                            buy: false,
                            sell: true,
                        });
                    } else {
                        console.log(chalk.yellow("NEUTRO"));
                        await emitMessage(
                            {
                                logs: {
                                    logAction: "Neutro",
                                    logEvent: "Resultado BBANDS",
                                    logMoeda: target_currency,
                                    logPrice: price.toFixed(8),
                                    previousPrice: previousPrice.toFixed(8),
                                    logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                                    logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                                    logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                },
                            },
                            user
                        );
                        await new LogModel({
                            logAction: "Neutro",
                            logEvent: "Resultado BBANDS",
                            logMoeda: `${target_currency}`,
                            logPrice: `${price.toFixed(8)}`,
                            previousPrice: `${previousPrice.toFixed(8)}`,
                            logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                            logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                            logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                            user,
                        }).save();
                        signal.push({
                            indicator: "BBANDS",
                            buy: false,
                            sell: false,
                        });
                    }
                } else {
                    console.log(chalk.yellow("NEUTRO"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Neutro",
                                logEvent: "Resultado BBANDS",
                                logMoeda: target_currency,
                                logPrice: price.toFixed(8),
                                previousPrice: previousPrice.toFixed(8),
                                logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                                logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                                logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Neutro",
                        logEvent: "Resultado BBANDS",
                        logMoeda: `${target_currency}`,
                        logPrice: `${price.toFixed(8)}`,
                        previousPrice: `${previousPrice.toFixed(8)}`,
                        logInfoOne: `Linha Lower = ${lower.toFixed(digits)}`,
                        logInfoTwo: `Linha Middle = ${middle.toFixed(digits)}`,
                        logInfoThree: `Linha Upper = ${upper.toFixed(digits)}`,
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                    signal.push({
                        indicator: "BBANDS",
                        buy: false,
                        sell: false,
                    });
                }
            }
        });
    }

    // CÓDIGO QUE CHAMA FUNÇÃO RESPONSÁVEL POR INSERIR UMA ORDEM DE COMPRA
    if (status_BUY === true) {
        const contIndicators = signal.length === 0 ? 1 : signal.length;
        let contSignals = 0;
        for (i in signal) {
            if (signal[i].buy === true) {
                contSignals++;
            }
        }
        if (contIndicators === contSignals) {
            if (ordersOpen.length <= maxOrdersOpen) {
                const resultOrder = await Order.orderBuy(config, params_order);
                if (resultOrder === 0) {
                    console.log(chalk.green("SALDO INSUFICIENTE PARA A TRANSAÇÃO!"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Saldo insuficiente para a transação",
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Saldo insuficiente para a transação",
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                } else {
                    console.log(chalk.green("ORDEM DE COMPRA CRIADA"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Ordem de compra criada",
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Ordem de compra criada",
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                }
            }
        }
    }

    // CÓDIGO QUE CHAMA FUNÇÃO RESPONSÁVEL POR INSERIR UMA ORDEM DE VENDA
    if (status_SELL === true) {
        if (sellForIndicator === true) {
            const contIndicators = signal.length === 0 ? 1 : signal.length;
            let contSignals = 0;
            for (i in signal) {
                if (signal[i].sell === true) {
                    contSignals++;
                }
            }
            if (contIndicators === contSignals) {
                if (ordersOpen !== null) {
                    for (let i = 0; i <= ordersOpen.length - 1; i++) {
                        await Order.orderSell(config, params_order, ordersOpen[i]);
                        console.log(chalk.green("ORDEM DE VENDA CRIADA"));
                        await emitMessage(
                            {
                                logs: {
                                    logAction: "Ordem de venda criada",
                                    date: time.format("DD-MM-YYYY HH:mm:ss"),
                                },
                            },
                            user
                        );
                        await new LogModel({
                            logAction: "Ordem de venda criada",
                            date: time.format("DD-MM-YYYY HH:mm:ss"),
                            user,
                        }).save();
                    }
                }
            }
        } else if (ordersOpen !== null) {
            for (let i = 0; i <= ordersOpen.length - 1; i++) {
                if (price >= ordersOpen[i].price + ordersOpen[i].price * profit) {
                    await Order.orderSell(config, params_order, ordersOpen[i]);
                    console.log(chalk.green("ORDEM DE VENDA CRIADA"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Ordem de venda comprada",
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Ordem de venda criada",
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                } else if (price <= ordersOpen[i].price - ordersOpen[i].price * stop) {
                    await Order.orderSell(config, params_order, ordersOpen[i]);
                    console.log(chalk.green("ORDEM DE VENDA CRIADA"));
                    await emitMessage(
                        {
                            logs: {
                                logAction: "Ordem de venda criada",
                                date: time.format("DD-MM-YYYY HH:mm:ss"),
                            },
                        },
                        user
                    );
                    await new LogModel({
                        logAction: "Ordem de venda criada",
                        date: time.format("DD-MM-YYYY HH:mm:ss"),
                        user,
                    }).save();
                }
            }
        }
    }
};

module.exports = { loadStrategy };
