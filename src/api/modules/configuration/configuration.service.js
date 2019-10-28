const Configuration = require("../../models/configurationModel");

const getConfiguration = async (uid) => {
    try {
        const result = await Configuration.findOne({ user_uid: uid });
        return result;
    } catch (error) {
        return error;
    }
};

const postConfiguration = async (query, values, options) => {
    try {
        const result = await Configuration.findOneAndUpdate(query, values, options);
        return result;
    } catch (error) {
        return error;
    }
};

module.exports = {
    getConfiguration,
    postConfiguration,
};
