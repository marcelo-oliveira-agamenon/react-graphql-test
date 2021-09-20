import React from "react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";

import Wrapper from "../components/wrapper";
import InputField from "../components/inputField";
import { Box, Button } from "@chakra-ui/core";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { withUrqlClient } from "next-urql";
import { urqlClient } from "../utils/createUrqlProvider";

const Login: React.FC<{}> = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name={"usernameOrEmail"}
              placeholder={"username or email"}
              label={"Username or Email"}
            />
            <Box mt={10}>
              <InputField
                name={"password"}
                placeholder={"password"}
                label={"password"}
                type="password"
              />
            </Box>
            <Button type="submit" mt={4} isLoading={isSubmitting}>
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(urqlClient)(Login);
