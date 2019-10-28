const bot = require("./services/botHeart");
const config = require("../configuration/configuration.service");

// requisição que aciona ou desliga o robo
const acionarRobo = async (req, res) => {
    try {
        const params = {
            user_uid: req.user.uid,
            status_bot: req.body.status_bot,
            status_buy: req.body.status_buy,
            status_sell: req.body.status_sell,
            key: req.user.uid,
        };
        const values = {
            status: {
                status_bot: req.body.status_bot,
                status_buy: req.body.status_buy,
                status_sell: req.body.status_sell,
                interval_check: 30000,
                key: req.user.uid,
            },
        };
        const query = { user_uid: params.user_uid };
        const options = { upsert: true, new: true };
        await config.postConfiguration(query, values, options);

        if (params.status_bot) {
            bot.roboLigado(params, req.user.uid);
            res.status(200).json({
                message: "Robo Ligado",
                status: "200",
            });
        } else {
            bot.roboDesligado(params, req.user.uid);
            res.status(200).json({
                message: "Robo Desligado",
                status: "200",
            });
        }
    } catch (e) {
        res.status(400).json({
            message: e.message,
            status: "400",
        });
    }
};

module.exports = { acionarRobo };
