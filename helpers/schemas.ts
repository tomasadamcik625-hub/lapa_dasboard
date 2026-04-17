import { object, ref, string } from "yup";

export const LoginSchema = object().shape({
  email: string()
    .email("Zadaj platný email")
    .required("Email je povinný"),
  password: string().required("Heslo je povinné"),
});

export const RegisterSchema = object().shape({
  name: string().required("Name is required"),
  email: string()
    .email("This field must be an email")
    .required("Email is required"),
  password: string().required("Password is required"),
  confirmPassword: string()
    .required("Confirm password is required")
    .oneOf([ref("password")], "Passwords must match"),
});
