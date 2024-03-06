import { ValidationMessages } from './user-form-model';

export const validationMessages: ValidationMessages = {
  givenName: {
    required: 'First name is required.',
  },
  familyName: {
    required: 'Last name is required.',
  },
  email: {
    required: 'Email address is required.',
    pattern: "This doesn't appear to be a valid email address.",
    existingName: 'This user exists already. If you want to edit it, ask a system administrator.',
  },
  username: {
    required: 'Username is required.',
    pattern: 'Spaces and special characters are not allowed in username',
    minlength: 'Username must be at least 4 characters long.', // Adjusted for simplicity
    existingName: 'This user exists already. If you want to edit it, ask a system administrator.',
  },
};
