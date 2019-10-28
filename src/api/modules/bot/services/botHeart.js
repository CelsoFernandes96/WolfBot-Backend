/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
const ccxt = require("ccxt");
const moment = require("moment");
const robo = require("set-interval");
const strategy = require("./botStrategies");
const configuracao = require("../../configuration/configuration.service");
const order = require("../../orders/orderService");

const acionarMonitoramento = (config, params, user) => {
    try {
        const nomeExchange = config.exchange.toLowerCase();
        const exchangeCCXT = new ccxt[nomeExchange]();
        exchangeCCXT.enableRateLimit = true;
        let periodo = "";
        const paramsOrder = { action: "Automatic", user_uid: config.user_uid };
        const unidadeTempo = config.candle_size.substr(-1);
        const unidadeTamanho = Number.parseInt(config.candle_size.substr(0), 10);
        const tamanhoCandle = config.candle_size;
        const arrayCurrencies = config.target_currency;

        if (unidadeTempo === "m") {
            periodo = "minutes";
        } else if (unidadeTempo === "h") {
            periodo = "hours";
        } else {
            periodo = "days";
        }
        const tempo = moment().subtract(100 * unidadeTamanho, periodo);
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        robo.start(
            async function load() {
                for (let i = 0; i <= arrayCurrencies.length - 1; i++) {
                    const parMoedas = `${arrayCurrencies[i]}/${config.base_currency}`;
                    const since = tempo.format("x");
                    const limit = 1000;
                    await sleep(10000); // milliseconds
                    const candle = await exchangeCCXT.fetchOHLCV(
                        parMoedas,
                        tamanhoCandle,
                        since,
                        limit
                    );
                    paramsOrder.currency = arrayCurrencies[i];
                    const ordersOpen = await order.getOrdersOpenByCurrency(paramsOrder);
                    await strategy.loadStrategy(
                        config,
                        params,
                        arrayCurrencies[i],
                        candle,
                        ordersOpen,
                        user
                    );
                }
                console.log(
                    "-----------------------------------------------------------------------------"
                );
            },
            config.status.interval_check,
            config.status.key
        );
    } catch (error) {
        console.log(error);
    }
};

async function roboLigado(params, user) {
    const config = await configuracao.getConfiguration(params.user_uid);
    console.log("########## Robo Ligado ##########");
    acionarMonitoramento(config, params, user);
}

function roboDesligado(params, user) {
    console.log("########## Robo Desligado ##########");
    robo.clear(params.key);
}

module.exports = { roboLigado, roboDesligado };
