import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (input: UsernamePasswordInput) => {
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
