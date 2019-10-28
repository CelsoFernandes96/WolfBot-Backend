/* eslint-disable camelcase */
/* eslint-disable max-depth */
/* eslint-disable max-statements */
const lodash = require("lodash");
const tulind = require("tulind");
const moment = require("moment");
const Backtest = require("../../../models/backtestModel");

const loadStrategy = async (config, candle) => {
    try {
        const ordersBuy = [];
        const ordersSell = [];
        const { sellForIndicator, profit, stop, user, target_currency } = config;
        const quantity = parseInt(config.quantity, 10);
        const timestamp = [];
        const open = [];
        const high = [];
        const low = [];
        const close = [];
        const volume = [];

        const signalBUY = [];
        const signalSELL = [];
        let numberOrdersBuy = 0;
        let numberOrdersSell = 0;
        moment.locale("pt-br");

        lodash.flatten(
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
                    return 0;
                })
            )
        );

        // ############################### INDICADOR EMA ################################
        if (config.indicator.name === "EMA") {
            const period = config.indicator.ema_period;
            tulind.indicators.ema.indicator([close], [period], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const arrayEMA = result[0];
                    const tendencia = {
                        up: 2,
                        down: -2,
                        persistence: 2,
                    };
                    let cont2 = 0;

                    // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                    for (let i = period - 1; i <= close.length - 1; i++) {
                        const ema = parseFloat(arrayEMA[cont2]);
                        const tendenciaUP = ema + tendencia.up;
                        const tendenciaDOWN = ema + tendencia.down;
                        cont2++;

                        if (close[i] < ema) {
                            if (
                                close[i] < tendenciaDOWN &&
                                close[i] > tendenciaDOWN - tendencia.persistence
                            ) {
                                signalBUY.push({
                                    candle: i,
                                    indicator: "EMA",
                                });
                            }
                        } else if (close[i] > ema) {
                            if (close[i] > tendenciaUP && sellForIndicator === true) {
                                signalSELL.push({
                                    candle: i,
                                    indicator: "EMA",
                                });
                            }
                        }
                    }
                }
            });
        }

        // ############################### INDICADOR MACD ################################
        if (config.indicator.name === "MACD") {
            const shortPeriod = config.indicator.macd_short_period;
            const longPeriod = config.indicator.macd_long_period;
            const signalPeriod = config.indicator.macd_signal_period;

            tulind.indicators.macd.indicator(
                [close],
                [shortPeriod, longPeriod, signalPeriod],
                (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const arrayMacd = result[0];
                        const arrayHistograma = result[2];
                        const tendencia = {
                            up: 0.025,
                            down: 0.025,
                            persistence: 1,
                        };
                        let cont2 = 0;

                        // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                        for (let i = longPeriod + 1; i <= candle.length - 1; i++) {
                            const macd = parseFloat(arrayMacd[cont2]);
                            const histograma = parseFloat(arrayHistograma[cont2]);
                            cont2++;

                            if (macd < 0) {
                                if (
                                    histograma > tendencia.up &&
                                    histograma < tendencia.up + tendencia.persistence &&
                                    close[i] >= close[i - 1]
                                ) {
                                    signalBUY.push({
                                        candle: i,
                                        indicator: "MACD",
                                    });
                                }
                            } else if (macd > 0) {
                                if (histograma < tendencia.down && sellForIndicator === true) {
                                    signalSELL.push({
                                        candle: i,
                                        indicator: "MACD",
                                    });
                                }
                            }
                        }
                    }
                }
            );
        }

        // ############################### INDICADOR STOCH ################################
        if (config.indicator.name === "STOCH") {
            const kPeriod = config.indicator.stoch_k_period;
            const kSlowPeriod = config.indicator.stoch_k_slow_period;
            const dPeriod = config.indicator.stoch_d_period;
            tulind.indicators.stoch.indicator(
                [high, low, close],
                [kPeriod, kSlowPeriod, dPeriod],
                (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const arrayK = result[0];
                        const arrayD = result[1];
                        const tendencia = {
                            up: 5,
                            down: 5,
                        };
                        let cont2 = 0;

                        // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                        for (let i = kPeriod + 1; i <= candle.length - 1; i++) {
                            const k = parseFloat(arrayK[cont2]);
                            const d = parseFloat(arrayD[cont2]);
                            cont2++;

                            if (k > 20) {
                                if (k > d && k < tendencia.up + 20 && close[i] >= close[i - 1]) {
                                    signalBUY.push({
                                        candle: i,
                                        indicator: "STOCH",
                                    });
                                }
                            } else if (k < 80) {
                                if (
                                    k < d &&
                                    k > 80 - tendencia.down &&
                                    close[i] <= close[i - 1] &&
                                    sellForIndicator === true
                                ) {
                                    signalSELL.push({
                                        candle: i,
                                        indicator: "STOCH",
                                    });
                                }
                            }
                        }
                    }
                }
            );
        }

        // ############################### INDICADOR CCI ################################
        if (config.indicator.name === "CCI") {
            const period = config.indicator.cci_period;
            tulind.indicators.cci.indicator([high, low, close], [period], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const arrayCCI = result[0];
                    const tendencia = {
                        up: 5,
                        down: -5,
                    };
                    let cont2 = 0;

                    // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                    for (let i = period + 1; i <= candle.length - 1; i++) {
                        const cci = parseFloat(arrayCCI[cont2]);
                        cont2++;

                        if (cci > 100 && cci < tendencia.up + 100 && close[i] >= close[i - 1]) {
                            signalBUY.push({
                                candle: i,
                                indicator: "STOCH",
                            });
                        } else if (
                            cci < -100 &&
                            cci > tendencia.up - 100 &&
                            close[i] <= close[i - 1] &&
                            sellForIndicator === true
                        ) {
                            signalSELL.push({
                                candle: i,
                                indicator: "STOCH",
                            });
                        }
                    }
                }
            });
        }

        // ############################### INDICADOR BBANDS ################################
        if (config.indicator.name === "BOLLINGER BANDS") {
            const period = config.indicator.bbands_period;
            const stddev = config.indicator.bbands_stddev_period;
            tulind.indicators.bbands.indicator([close], [period, stddev], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const arrayBbandsLower = result[0];
                    const arrayBbandsUpper = result[2];
                    const tendencia = {
                        up: 5,
                        down: 5,
                    };
                    let cont2 = 0;

                    // LÓGICA PARA ENVIO DE SINAL DE COMPRA E VENDA COM INDICADOR
                    for (let i = period + 1; i <= candle.length - 1; i++) {
                        const lower = parseFloat(arrayBbandsLower[cont2]);
                        const upper = parseFloat(arrayBbandsUpper[cont2]);
                        cont2++;

                        if (
                            close[i] <= lower &&
                            close[i] > lower - tendencia.down &&
                            close[i] >= close[i - 1]
                        ) {
                            signalBUY.push({
                                candle: i,
                                indicator: "STOCH",
                            });
                        } else if (
                            close[i] >= upper &&
                            close[i] < upper + tendencia.up &&
                            close[i] <= close[i - 1] &&
                            sellForIndicator === true
                        ) {
                            signalSELL.push({
                                candle: i,
                                indicator: "STOCH",
                            });
                        }
                    }
                }
            });
        }

        for (let i = 0; i <= candle.length - 1; i++) {
            for (let j = 0; j <= signalBUY.length - 1; j++) {
                if (signalBUY[j].candle === i) {
                    const preco = parseFloat(candle[i][4]);
                    const timeCandle = moment(candle[i][0]);
                    ordersBuy.push({
                        candle: i,
                        tipoOrdem: "COMPRA",
                        status: "aberta",
                        amount: (quantity / preco).toFixed(8),
                        cost: quantity,
                        precoComprado: preco,
                        horaCompra: timeCandle,
                        target: profit,
                        ordemCompraNumero: ++numberOrdersBuy,
                    });
                }
            }
            if (sellForIndicator === true) {
                for (let k = 0; k <= ordersBuy.length - 1; k++) {
                    if (ordersBuy[k].status === "aberta") {
                        for (let x = 0; x <= signalSELL.length - 1; x++) {
                            if (signalSELL[x].candle === i) {
                                const preco = parseFloat(candle[i][4]);
                                const timeCandle = moment(candle[i][0]);
                                const costSell = ordersBuy[k].amount * preco;
                                const profitSell = costSell - ordersBuy[k].cost;
                                const percentage = profitSell / ordersBuy[k].cost;
                                ordersSell.push({
                                    candle: i,
                                    tipoOrdem: "VENDA",
                                    status: "fechada",
                                    amount: ordersBuy[k].amount,
                                    precoComprado: ordersBuy[k].precoComprado,
                                    horaCompra: ordersBuy[k].horaCompra,
                                    precoVendido: preco,
                                    lucroObtido: profitSell,
                                    percentualGanho: percentage,
                                    horaVenda: timeCandle,
                                    ordemVendaNumero: ++numberOrdersSell,
                                });
                            }
                        }
                    }
                }
            } else {
                for (let x = 0; x <= ordersBuy.length - 1; x++) {
                    if (ordersBuy[x].status === "aberta") {
                        const preco = parseFloat(candle[i][4]);
                        const timeCandle = moment(candle[i][0]);
                        const costSell = ordersBuy[x].amount * preco;
                        const profitSell = costSell - ordersBuy[x].cost;
                        const percentage = profitSell / ordersBuy[x].cost;
                        if (
                            preco >=
                            ordersBuy[x].precoComprado + ordersBuy[x].precoComprado * profit
                        ) {
                            ordersBuy[x].status = "fechada";
                            ordersSell.push({
                                candle: i,
                                tipoOrdem: "VENDA",
                                status: "fechada",
                                amount: ordersBuy[x].amount,
                                precoComprado: ordersBuy[x].precoComprado,
                                horaCompra: ordersBuy[x].horaCompra,
                                precoVendido: preco,
                                lucroObtido: profitSell,
                                percentualGanho: percentage,
                                horaVenda: timeCandle,
                                ordemVendaNumero: ++numberOrdersSell,
                            });
                        } else if (
                            preco <=
                            ordersBuy[x].precoComprado - ordersBuy[x].precoComprado * stop
                        ) {
                            ordersBuy[x].status = "fechada";
                            ordersSell.push({
                                candle: i,
                                tipoOrdem: "VENDA",
                                status: "fechada",
                                amount: ordersBuy[x].amount,
                                precoComprado: ordersBuy[x].precoComprado,
                                horaCompra: ordersBuy[x].horaCompra,
                                precoVendido: preco,
                                lucroObtido: profitSell,
                                percentualGanho: percentage,
                                horaVenda: timeCandle,
                                ordemVendaNumero: ++numberOrdersSell,
                            });
                        }
                    }
                }
            }
        }

        let profitResult = 0;
        let percentageResult = 0;
        let cost = 0;
        for (let i = 0; i <= ordersSell.length - 1; i++) {
            cost += ordersBuy[i].cost;
            profitResult += ordersSell[i].lucroObtido;
            percentageResult += ordersSell[i].percentualGanho;
        }

        const backtestResult = await Backtest.create({
            dateTest: moment(),
            cost,
            currency: target_currency,
            ordersBuy,
            ordersSell,
            profit: profitResult,
            percentage: ordersSell.length > 0 ? (percentageResult / ordersSell.length) * 100 : 0,
            user,
        });

        if (backtestResult) {
            return backtestResult;
        }
    } catch (error) {
        return error;
    }
};

module.exports = {
    loadStrategy,
};
