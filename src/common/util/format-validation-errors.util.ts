import type { ValidationError } from 'class-validator';

export function formatValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  for (const error of errors) {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      formattedErrors[propertyPath] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(
        formattedErrors,
        formatValidationErrors(error.children, propertyPath),
      );
    }
  }

  return formattedErrors;
}
