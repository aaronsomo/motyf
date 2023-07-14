import React from 'react';
import { ErrorCodes, ERROR_MESSAGES } from 'error_codes';

function getEnumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

const formatErrorMessage = (error: ErrorCodes): string =>
  getEnumKeys(ERROR_MESSAGES).includes(error)
    ? ERROR_MESSAGES[error]
    : error;

export const ErrorMessage: React.FC<{ error: string; customMessage?: boolean; danger?: boolean }> = ({
  error,
  danger = true,
}) => {
  if (error === '') {
    return null;
  }

  return (
    <p style={{ color: danger ? 'red' : 'black', textTransform: 'uppercase' }}>
      {formatErrorMessage(error as ErrorCodes)}
    </p>
  );
};
