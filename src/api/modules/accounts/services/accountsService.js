const _ = require("lodash");
const admin = require("firebase-admin");
const firebase = require("firebase");
const os = require("os");
const moment = require("moment");

const User = require("../../../models/userModel");
const AccountLog = require("../../../models/accountsLogModel");
const response = require("./accountsResponse");
const dateFunctions = require("../../../utils/functions/dates");
const enumerator = require("../../../utils/enumerators/accounts");
const Activity = require("../../../models/activitiesModel");

const signup = async (res, user) => {
    const { name, email, password } = user;

    try {
        const userCreated = await firebase.auth().createUserWithEmailAndPassword(email, password);

        const userMongo = await new User({
            name,
            email,
            password,
            uid: userCreated.user.uid,
            sockets: [],
        }).save();

        const log = new AccountLog({
            user: userMongo._id,
            verifiedEmail: false,
            expirationDate: dateFunctions.createMomentDate().add(1, "days"),
            verificationDate: null,
            logType: enumerator.accountLogTypes.emailActivation,
            pending: true,
            uid: userCreated.user.uid,
        });

        await Promise.all([userCreated.user.sendEmailVerification(), log.save()]);

        return res.status(201).json({
            success: true,
            logType: enumerator.accountLogTypes.emailActivation,
        });
    } catch (error) {
        console.error(error);
        response.constructionErrorMessage(res, error);
    }
};

const activeAccount = async (res, code) => {
    try {
        const resultActiveAccount = await firebase.auth().checkActionCode(code);
        if (resultActiveAccount.operation === "VERIFY_EMAIL") {
            const { email } = resultActiveAccount.data;

            const firebaseUser = await admin.auth().getUserByEmail(email);
            const log = await AccountLog.findOne({
                uid: firebaseUser.uid,
                logType: enumerator.accountLogTypes.emailActivation,
                pending: true,
                expirationDate: { $gt: dateFunctions.createMomentDate() },
            })
                .sort({ createdAt: -1 })
                .lean();

            if (firebaseUser.emailVerified)
                return response.constructionErrorMessage(res, {
                    code: "auth/email-is-active",
                });

            if (
                !Object.keys(log || {}).length ||
                dateFunctions.createMomentDate() > log.expirationDate
            ) {
                return response.constructionErrorMessage(res, {
                    code: "auth/invalid-action-code",
                });
            }

            await admin.auth().updateUser(firebaseUser.uid, { emailVerified: true });
            await AccountLog.updateOne(
                { _id: log._id },
                {
                    verifiedEmail: true,
                    verificationDate: dateFunctions.createMomentDate(),
                    pending: false,
                }
            );

            return res.status(200).json({
                mode: enumerator.accountLogTypes.emailActivation,
            });
        }

        if (resultActiveAccount.operation === "PASSWORD_RESET") {
            const log = await AccountLog.findOne({
                logType: enumerator.accountLogTypes.passwordReset,
                pending: true,
                expirationDate: { $gt: dateFunctions.createMomentDate() },
            })
                .sort({ createdAt: -1 })
                .lean();
            if (
                !Object.keys(log || {}).length ||
                dateFunctions.createMomentDate() > log.expirationDate
            ) {
                return response.constructionErrorMessage(res, {
                    code: "auth/invalid-action-code",
                });
            }

            await AccountLog.updateOne(
                { _id: log._id },
                {
                    verificationDate: dateFunctions.createMomentDate(),
                    pending: false,
                    code,
                }
            );

            return res.status(200).json({
                mode: enumerator.accountLogTypes.passwordReset,
            });
        }
        return res.status(400).json({});
    } catch (error) {
        return response.constructionErrorMessage(res, error);
    }
};

const authenticate = async (email, password) => {
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);

        const currentUser = firebase.auth().currentUser.toJSON();

        return {
            success: true,
            authenticatedUser: {
                uid: currentUser.uid,
                email: currentUser.email,
                emailVerified: currentUser.emailVerified,
                isAnonymous: currentUser.isAnonymous,
                refreshToken: currentUser.stsTokenManager.refreshToken,
                accessToken: currentUser.stsTokenManager.accessToken,
                expirationTime: dateFunctions.convertTimeStampToHours(
                    currentUser.stsTokenManager.expirationTime
                ),
                createdAt: dateFunctions.convertTimeStampToHours(Number(currentUser.createdAt)),
                lastLoginAt: dateFunctions.convertTimeStampToHours(Number(currentUser.lastLoginAt)),
            },
        };
    } catch (error) {
        return {
            success: false,
            error,
        };
    }
};

// eslint-disable-next-line max-params
const login = async (res, email, password, browser, ip) => {
    const authResult = await authenticate(email, password);

    if (!authResult.success) return response.constructionErrorMessage(res, authResult.error);

    const arrDate = moment()
        .format("L")
        .split("/");

    const systemInfo = {
        date: `${arrDate[1]}/${arrDate[0]}/${arrDate[2]} - ${moment().format("LTS")}`,
        browser,
        ip,
        userEmail: email,
    };

    // OS Platform
    switch (os.platform()) {
        case "win32":
        case "win64":
            systemInfo.osPlatform = `Windows ${os.release()}`;
            break;
        case "linux":
            systemInfo.osPlatform = `Linux ${os.release()}`;
            break;
        case "android":
            systemInfo.osPlatform = `Android ${os.release()}`;
            break;
        default:
            systemInfo.osPlatform = "Não identificado";
            break;
    }

    const activity = new Activity({ ...systemInfo });

    await activity.save();

    if (!authResult.authenticatedUser.emailVerified)
        return response.constructionErrorMessage(res, {
            code: "auth/email-is-not-active",
        });

    await User.update({ email }, { sockets: [] });

    return res.status(200).json(authResult);
};

const userInfo = async (req, res) => {
    const { user } = req;
    return res.status(200).json(user);
};

const createToken = async (res, email, password) => {
    const authResult = await authenticate(email, password);

    if (!authResult.sucess) return response.constructionErrorMessage(res, authResult.error);

    if (!authResult.authenticatedUser.emailVerified)
        return response.constructionErrorMessage(res, {
            code: "auth/email-is-not-active",
        });
};

const passwordRecovery = async (res, next, email) => {
    const mongoUser = await User.findOne({ email }).lean();

    if (!mongoUser)
        return res.status(400).json({
            success: false,
            errors: [
                {
                    message: "Não existe usuário cadastrado com esse endereço de email!",
                },
            ],
        });

    const firebaseUser = await admin.auth().getUserByEmail(email);

    const log = new AccountLog({
        uid: firebaseUser.uid,
        user: mongoUser._id,
        expirationDate: dateFunctions.createMomentDate().add(1, "days"),
        verificationDate: null,
        logType: enumerator.accountLogTypes.passwordReset,
        pending: true,
    });

    await Promise.all([firebase.auth().sendPasswordResetEmail(email), log.save()]);

    return res.status(201).json({
        success: true,
        mode: enumerator.accountLogTypes.passwordReset,
    });
};

const changePassword = async (res, next, password, code) => {
    const user = await AccountLog.findOne({
        code,
        pending: false,
    }).lean();

    await Promise.all([
        admin.auth().updateUser(user.uid, {
            password,
        }),
        User.update(
            {
                _id: user._id,
                email: user.email,
            },
            { password }
        ),
    ]);

    return res.status(200).json({
        success: true,
    });
};

const manageSocket = async (res, next, body) => {
 
    return res.status(200).json({ body });
};

module.exports = {
    passwordRecovery,
    signup,
    login,
    userInfo,
    createToken,
    changePassword,
    activeAccount,
    manageSocket,
};
