const dictionary = require("../../../utils/dictionaries/accountDictionary");

const constructionErrorMessage = (res, error) => {
    const sucess = false;
    switch (error.code) {
        case "auth/email-already-in-use":
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.emailIsUsing],
            });
        case "auth/invalid-action-code": {
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.activeAccountCodeIsInvalid],
            });
        }
        case "auth/email-is-active": {
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.emailIsActive],
            });
        }
        case "auth/email-is-not-active": {
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.emailIsNotActive],
            });
        }
        case "auth/wrong-password": {
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.loginFailed],
            });
        }
        case "auth/user-not-found": {
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.userIsEmpty],
            });
        }
        case "auth/invalid-email": {
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.emailIsInvalid],
            });
        }
        case "auth/too-many-requests": {
            return res.status(400).json({
                sucess,
                errors: [dictionary.account.manyRequestsLogin],
            });
        }
        case "auth/token-is-empty": {
            return res.status(401).json({
                sucess,
                errors: [dictionary.account.tokenIsEmpty],
            });
        }
        case "auth/id-token-expired": {
            return res.status(401).json({
                sucess,
                errors: [dictionary.account.tokenExpired],
            });
        }
        case "auth/argument-error": {
            return res.status(401).json({
                sucess,
                errors: [dictionary.account.tokenIsInvalid],
            });
        }
        default:
            return res.status(500).json({
                sucess,
                errors: [error],
            });
    }
};

module.exports = {
    constructionErrorMessage,
};
