export function validateScopes(scopes: string, validScopes: string[]): boolean {
  return scopes
    .split(detectDelimiter(scopes))
    .every((e) => validScopes.includes(e));
}

export function scopesMatch(scopes: string, requiredScopes: string): boolean {
  const scopesArray = scopes.split(detectDelimiter(scopes));
  const requiredScopesArray = requiredScopes.split(
    detectDelimiter(requiredScopes)
  );
  return requiredScopesArray.every((e) => scopesArray.includes(e));
}

export function hasScope(scopes: string, scope: string): boolean {
  return scopes.split(detectDelimiter(scopes)).includes(scope);
}

export function detectDelimiter(scopes: string): string {
  if (scopes.includes('+')) {
    return '+';
  }
  return ' ';
}
