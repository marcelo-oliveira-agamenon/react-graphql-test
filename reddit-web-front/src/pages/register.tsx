import React from "react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";

import Wrapper from "../components/wrapper";
import InputField from "../components/inputField";
import { Box, Button } from "@chakra-ui/core";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { withUrqlClient } from "next-urql";
import { urqlClient } from "../utils/createUrqlProvider";

interface registerProps {}
const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name={"username"}
              placeholder={"username"}
              label={"username"}
            />
            <Box mt={6}>
              <InputField
                name={"email"}
                placeholder={"email"}
                label={"email"}
              />
            </Box>
            <Box mt={6}>
              <InputField
                name={"password"}
                placeholder={"password"}
                label={"password"}
                type="password"
              />
            </Box>
            <Button type="submit" mt={6} isLoading={isSubmitting}>
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(urqlClient)(Register);
