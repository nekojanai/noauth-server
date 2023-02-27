export const VALID_SCOPES = [
  'read',
  'write',
  'admin',
  'admin:read',
  'admin:write',
];

export function validateScopes(scopes: string): boolean {
  return scopes
    .split(detectDelimiter(scopes))
    .every((e) => VALID_SCOPES.includes(e));
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
