const statisticService = require("./statistic.service");

const graphicTotalOrden = async (req, res) => {
    try {
        const result = await statisticService.getTotalOrden();
        let totalClose = result[0] ? result[0].total : 0;
        let totalOpen = result[1] ? result[1].total : 0;

        return res.status(200).json({
            success: true,
            "Open": totalOpen, 
            "Close": totalClose
        });
    } catch (e) {
        return res.status(400).json({
            message: e.message,
            status: "400",
        });
    }
};

const graphicOrderPerDay = async (req, res) => {
    try {
        const result = await statisticService.getOrderPerDay();

        const arrayResult = [ 0, 0, 0, 0 ];

        result.map((item) => {
            switch (item._id) {
                case 5:
                    arrayResult.push(item.total);
                break;
                case 6:
                    arrayResult.push(item.total);
                break;
            }
        });

        for (let i = 0; i < 6; i+=1) {
            arrayResult.push(0);
        }

        return res.status(200).json({
            success: true,
            data: arrayResult
        });
    } catch (e) {
        return res.status(400).json({
            message: e.message,
            status: "400",
        });
    }
};

const graphicProfitPerDay = async (req, res) => {
    try {
        const resultBuy = await statisticService.getProfitCloseBuy();
        const resultSell = await statisticService.getProfitCloseSell();

        let totalResultBuy = [ 0, 0, 0, 0];
        let totalResultSell = [ 0, 0, 0, 0];

        resultBuy.map((item) => {
            switch (item._id) {
                case 5:
                    totalResultBuy.push(item.totalBuy);
                break;
            }
        });

        resultSell.map((item) => {
            switch (item._id) {
                case 5:
                    totalResultSell.push(item.totalSell);
                break;
                case 6:
                    totalResultSell.push(item.totalSell);
                break;
            }
        });

        for (let i = 0; i < 7; i+=1) {
            totalResultBuy.push(0);
        }

        for (let i = 0; i < 6; i+=1) {
            totalResultSell.push(0);
        }

        return res.status(200).json({
            success: true,
            totalResultBuy, 
            totalResultSell
        });
    } catch (e) {
        return res.status(400).json({
            message: e.message,
            status: "400",
        });
    }
};

module.exports = {
    graphicTotalOrden,
    graphicOrderPerDay,
    graphicProfitPerDay
};
