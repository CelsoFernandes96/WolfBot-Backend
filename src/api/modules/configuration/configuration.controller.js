const _ = require("lodash");
const Configuration = require("./configuration.service");

// Método generico que irá tratar erros de banco de dados
const sendErrorsFromDB = (res, dbErrors) => {
    const errors = [];
    _.forIn(dbErrors.errors, (error) => errors.push(error.message));
    return res.status(400).json({ errors });
};

// Método que retorna uma configuração salva no banco
const get = async (req, res) => {
    const { uid } = req.user;
    try {
        const configuracao = await Configuration.getConfiguration(uid);
        return res.status(200).json({
            configuracao,
            message: "Configuração recuperada com sucesso!",
        });
    } catch (error) {
        return sendErrorsFromDB(res, error);
    }
};

// Método que salva uma configuração no banco de dados
const post = (req, res) => {
    const { uid } = req.user;
    const values = req.body;
    const query = { user_uid: uid };
    const options = { upsert: true, new: true };
    try {
        const configuracao = Configuration.postConfiguration(query, values, options);
        return res.status(200).json({
            configuracao,
            message: "Configuração gravada com sucesso!",
        });
    } catch (error) {
        return sendErrorsFromDB(res, error);
    }
};

module.exports = {
    get,
    post,
};
