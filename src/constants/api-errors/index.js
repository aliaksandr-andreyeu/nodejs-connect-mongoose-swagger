export const apiErrors = {
  common: {
    fieldEmpty: (fieldName) => `Field '${fieldName}' is empty`,
    fieldRequired: (fieldName) => `Field '${fieldName}' is required`,
    fieldNotNumber: (fieldName) => `Field '${fieldName}' is not a number`,
    bodyIsEmpty: 'Request body is null or empty',
    invalidJSON: 'Invalid JSON message received'
  },
  user: {
    notFound: 'User not found',
    notUpdated: 'User not updated'
  }
};
