export const apiErrors = {
  common: {
    fieldEmpty: (fieldName: string) => `Field '${fieldName}' is empty`,
    fieldRequired: (fieldName: string) => `Field '${fieldName}' is required`,
    fieldNotNumber: (fieldName: string) => `Field '${fieldName}' is not a number`,
    bodyIsEmpty: 'Request body is null or empty',
    invalidJSON: 'Invalid JSON message received',
    payloadTooLarge: 'Request body is too large',
    unauthorized: 'Authorization Required'
  },
  user: {
    notFound: 'User not found',
    notUpdated: 'User not updated',
    exists: (email: string) => `User with email '${email}' already exists`,
    passwordIncorrect: 'Incorrect password',
    confirmIncorrect: 'Incorrect password confirmation',
    sameOldNewPassword: 'New password cannot be the same as old password',
    resetTokenInvalid: 'Reset token is invalid or has expired'
  }
} as const;
