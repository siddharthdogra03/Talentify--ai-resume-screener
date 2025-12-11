export const validatePassword = (password: string): boolean => {
  const hasLength = password.length >= 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasSmall = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasLength && hasCapital && hasSmall && hasNumber && hasSymbol;
};

export const updatePasswordRequirements = (password: string) => {
  return {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    small: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
};