import { Form, Formik } from "formik";
import { NextPage } from "next";
import Wrapper from "../../components/wrapper";
import InputField from "../../components/inputField";
import React from "react";
import { Button } from "@chakra-ui/core";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return (
    <Wrapper variant="small">
      <Formik initialValues={{ newPassword: "" }} onSubmit={() => {}}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name={"newPassword"}
              placeholder={"new password"}
              label={"new password"}
              type="password"
            />

            <Button type="submit" mt={4} isLoading={isSubmitting}>
              reset password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
