"use client";

import { loginAction } from "@/actions/auth.action";
import { LoginSchema } from "@/helpers/schemas";
import { LoginFormType } from "@/helpers/types";
import { Button, Input } from "@nextui-org/react";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export const Login = () => {
  const router = useRouter();
  const [authError, setAuthError] = useState("");

  const initialValues: LoginFormType = {
    email: "",
    password: "",
  };

  const handleLogin = useCallback(
    async (values: LoginFormType) => {
      setAuthError("");
      const result = await loginAction(values.email, values.password);
      if (result.success) {
        router.replace("/");
      } else {
        setAuthError(result.error || "Nesprávne prihlasovacie údaje");
      }
    },
    [router]
  );

  return (
    <>
      <div className="text-center text-[25px] font-bold mb-6">Prihlásenie</div>

      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}>
        {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
          <>
            <div className="flex flex-col w-1/2 gap-4 mb-4">
              <Input
                variant="bordered"
                label="Email"
                type="email"
                value={values.email}
                isInvalid={!!errors.email && !!touched.email}
                errorMessage={errors.email}
                onChange={handleChange("email")}
              />
              <Input
                variant="bordered"
                label="Heslo"
                type="password"
                value={values.password}
                isInvalid={!!errors.password && !!touched.password}
                errorMessage={errors.password}
                onChange={handleChange("password")}
              />
              {authError && (
                <p className="text-red-500 text-sm text-center">{authError}</p>
              )}
            </div>

            <Button
              onPress={() => handleSubmit()}
              variant="flat"
              color="primary"
              isLoading={isSubmitting}>
              Prihlásiť sa
            </Button>
          </>
        )}
      </Formik>
    </>
  );
};
