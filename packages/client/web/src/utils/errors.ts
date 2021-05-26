import { ValidationError } from 'yup';

export interface IErrors {
  [key: string]: string;
}

export const getValidationErrors = (err: ValidationError): IErrors => {
  const errors: IErrors = {};

  err.inner.forEach((error) => {
    errors[error.path] = error.message;
  });

  return errors;
};
