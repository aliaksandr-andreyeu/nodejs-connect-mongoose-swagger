export const apiErrors = {
  common: {
    fieldEmpty: (fieldName) => `Field '${fieldName}' is empty`,
    fieldRequired: (fieldName) => `Field '${fieldName}' is required`,
    fieldNotNumber: (fieldName) => `Field '${fieldName}' is not a number`,
    bodyIsEmpty: 'Request body is null or empty',
    invalidJSON: 'Invalid JSON message received',
    unauthorized: 'Authorization Required'
  },
  user: {
    notFound: 'User not found',
    notUpdated: 'User not updated',
    exists: (email) => `User with email '${email}' already exists`,
    passwordIncorrect: 'Incorrect password',
    confirmIncorrect: 'Incorrect password confirmation',
    sameOldNewPassword: 'New password cannot be the same as old password'
  }
};
