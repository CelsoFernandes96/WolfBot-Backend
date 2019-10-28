module.exports = {
    account: {
        emailIsEmpty: { message: "O email é obrigatório." },
        emailIsInvalid: { message: "O email informado está inválido." },
        passwordIsInvalid: {
            message:
                "Ops! A senha deve conter de 6 a 20 caracteres, com letra maiuscula e caracteres especiais.",
        },
        passwordDiferentIsConfirm: {
            message: "A senha e a senha de confirmação não conferem.",
        },
        nameIsEmpty: { message: "O nome é obrigatório." },
        passwordIsEmpty: { message: "A senha é obrigatório." },
        passwordConfirmIsEmpty: {
            message: "A senha de confirmação é obrigatória.",
        },
        emailIsUsing: {
            message: "O email já está sendo utilizado por outro usuário",
        },
        emailIsNotActive: { message: "O email informado não foi verificado!" },
        loginFailed: { message: "Email ou senha inválidos!" },
        userIsEmpty: {
            message: "Não existe nenhum usuário com esse endereço de email.",
        },
        manyRequestsLogin: {
            message:
                "Muitas tentativas de login malsucedidas.Por favor, inclua a verificação reCaptcha ou tente novamente mais tarde.",
        },
        activeAccountCodeIsInvalid: {
            message:
                "O código de ação é inválido. Isso pode acontecer se o código estiver mal informado, expirado ou já tiver sido usado.",
        },
        emailIsActive: {
            message: "Email já foi verificado pelo usuário",
        },
        tokenIsEmpty: {
            message: "Token não enviado na requisição",
        },
        tokenExpired: {
            message: "Token expirado",
        },
        tokenIsInvalid: {
            message: "Token inválido",
        },
    },
};
