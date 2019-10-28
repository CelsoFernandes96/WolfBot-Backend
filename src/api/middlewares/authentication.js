const admin = require("firebase-admin");
const firebase = require("firebase");
const response = require("../modules/accounts/services/accountsResponse");
const dates = require("../utils/functions/dates");
const moment = require("moment");

module.exports = async (req, res, next) => {
    if (req.method === "OPTIONS") next();
    else {
        const { authorization } = req.headers;

        if (!authorization)
            return response.constructionErrorMessage(res, {
                code: "auth/token_is_empty",
            });

        try {
            const firebaseUserInfo = await admin.auth().verifyIdToken(authorization);

            req.user = {
                ...firebaseUserInfo,
                exp: moment.unix(firebaseUserInfo.exp).format(),
                iat: moment.unix(firebaseUserInfo.iat).format(),
                auth_time: moment.unix(firebaseUserInfo.auth_time).format(),
            };

            next();
        } catch (error) {
            return response.constructionErrorMessage(res, error);
        }
    }
};
