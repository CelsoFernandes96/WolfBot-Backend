const dictionary = require("../../utils/dictionaries/accountDictionary");

const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})/;

const validSavePerfilUser = (user) => ({
    email: user.email ? user.email : "",
    name: user.name ? user.name : "",
    lastname: user.lastname ? user.lastname : "",
    address: user.address ? user.address : "",
    city: user.city ? user.city : "",
    country: user.country ? user.country : "",
    about: user.about ? user.about : "",
});

const validChangePassword = (password, new_password) => {
    const errors = [];

    if (!password) errors.push(dictionary.account.passwordIsEmpty);

    if (!new_password) errors.push({ message: "A nova senha é obrigatório." });

    if (password && !password.match(passwordRegex))
        errors.push(dictionary.account.passwordIsInvalid);

    return errors;
};

module.exports = {
    validSavePerfilUser,
    validChangePassword,
};
