const admin = require("firebase-admin");
const moment = require("moment");

const User = require("../../models/userModel");
const UserLogs = require("../../models/accountsLogModel");
const Activities = require("../../models/activitiesModel");
const emitMessage = require("../../utils/functions/emitMessage");
const LogModel = require("../../models/logModel");

const savePerfilUser = async (res, user) => {
    await User.findOneAndUpdate({ uid: user.uid }, user);
    return res.status(200).json({
        success: true,
    });
};

const getPerfilUser = async (res, uid) => {
    const user = await User.find({ uid }).lean();

    await emitMessage(
        {
            logs: {
                logAction: "Neutro",
                logEvent: "Resultado MACD",
                logMoeda: "BTC",
                logPrice: 9999,
                previousPrice: 9999,
                logInfoOne: "Linha MACD = TESTE",
                logInfoTwo: "Linha Sinal = TESTE",
                logInfoThree: "Histograma = TESTE",
                date: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
        },
        uid
    );
    await new LogModel({
        logAction: "Neutro",
        logEvent: "Resultado MACD",
        logMoeda: "BTC",
        logPrice: 9999,
        previousPrice: 9999,
        logInfoOne: "Linha MACD = TESTE",
        logInfoTwo: "Linha Sinal = TESTE",
        logInfoThree: "Histograma = TESTE",
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
        user: uid,
    }).save();
    return res.status(200).json({
        success: true,
        data: user,
    });
};

const changePassword = async (res, input) => {
    const errors = [];
    const user = await User.findOne({ password: input.password, uid: input.uid }).lean();

    if (!user) {
        errors.push({
            message: "A senha informada está inválida.",
        });
    }

    if (errors.length)
        return res.status(400).json({
            success: false,
            errors,
        });

    await User.findOneAndUpdate({ uid: input.uid }, { password: input.new_password });
    await admin.auth().updateUser(input.uid, {
        password: input.new_password,
    });

    return res.status(200).json({
        success: true,
    });
};

const deleteAccount = async (res, uid, password) => {
    const user = await User.findOne({ uid, password }).lean();

    if (!user)
        return res.status(400).json({
            success: false,
            errors: [
                {
                    message: "A senha informada está inválida!",
                },
            ],
        });

    await Promise.all([
        User.deleteMany({ uid }),
        UserLogs.deleteMany({ uid }),
        admin.auth().deleteUser(uid),
    ]);

    return res.status(200).json({
        success: true,
        data: "Ok",
    });
};

const getActivities = async (res, userEmail) => {
    const activities = await Activities.find({ userEmail })
        .sort({ createdAt: -1 })
        .lean();
    return res.status(200).json({
        success: true,
        data: activities,
    });
};

module.exports = {
    savePerfilUser,
    getPerfilUser,
    changePassword,
    deleteAccount,
    getActivities,
};
