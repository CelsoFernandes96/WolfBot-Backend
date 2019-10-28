const validator = require("./accountsValidation");
const service = require("./services/accountsService");
const get_ip = require("ipware")().get_ip;

const signup = async (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;

    const errors = await validator.validSignup({ name, email, password, passwordConfirm });

    return errors.length
        ? res.status(400).json({ success: false, errors })
        : service.signup(res, { name, email, password });
};

const activeAccount = async (req, res) => {
    const { code } = req.headers;
    if (!code) {
        return res.status(400).json({
            errors: [{ message: "'code' na requisição é obrigatório" }],
        });
    }
    await service.activeAccount(res, code);
};

const login = async (req, res) => {
    const { email, password, browser } = req.body;
    const errors = validator.validLogin(email, password);

    return errors.length
        ? res.status(400).json({ sucess: false, errors })
        : service.login(res, email, password, browser, get_ip(req).clientIp);
};

const userInfo = async (req, res) => await service.userInfo(req, res);

const createToken = (req, res) => {
    const { email, password } = req.body;
    const errors = validator.validLogin(email, password);
    return errors.length
        ? res.status(400).json({ errors })
        : service.createToken(res, email, password);
};

const passwordRecovery = async (req, res, next) => {
    const { email } = req.body;
    await service.passwordRecovery(res, next, email);
};

const changePassword = async (req, res, next) => {
    const { password, passwordConfirm, code } = req.body;
    const errors = validator.changePasswordValidation(password, passwordConfirm, code);
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors,
        });
    }
    return await service.changePassword(res, next, password, code);
};

const manageSocket = async (req, res, next) => {
    const { localStorageObject } = req.body;
    await service.manageSocket(res, next, localStorageObject);
};

module.exports = {
    login,
    createToken,
    signup,
    userInfo,
    passwordRecovery,
    changePassword,
    activeAccount,
    manageSocket,
};
