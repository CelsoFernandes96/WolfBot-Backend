const Dashboard = require("./dashboard.service");
const LogsModel = require("../../models/logModel");

const dataDashboard = async (req, res) => {
    try {
        const { uid } = req.user;
        const dayResult = await Dashboard.dayResult(uid);
        const openOrdersTableResult = await Dashboard.openOrdersTable(uid);
        const operationsSummaryResult = await Dashboard.operationsSummary(uid);
        const overallResult = await Dashboard.overallResult(uid);
        const totalizerResult = await Dashboard.totalizerOpenOrdersAndClosedOrders(uid);
        const totalAssets = await Dashboard.totalAssets(uid);
        const logs = await LogsModel.find({ user: uid })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            data: {
                dayResult,
                openOrdersTableResult,
                operationsSummaryResult,
                overallResult,
                totalizerResult,
                totalAssets,
                logs,
            },
        });
    } catch (error) {
        res.status(400).json({
            message: error,
        });
    }
};

module.exports = { dataDashboard };
