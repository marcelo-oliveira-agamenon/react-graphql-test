"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (input) => {
    if (input.username.length <= 2) {
        return [
            {
                field: "username",
                message: "short username field length",
            },
        ];
    }
    if (!input.email.includes("@")) {
        return [
            {
                field: "email",
                message: "invalid email",
            },
        ];
    }
    if (!input.username.includes("@")) {
        return [
            {
                field: "username",
                message: "cannot include an @",
            },
        ];
    }
    if (input.password.length <= 2) {
        return [
            {
                field: "username",
                message: "short password field length",
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map