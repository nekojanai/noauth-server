export const VALID_SCOPES = [
  'read',
  'write',
  'admin:read',
  'admin:write'
];

export function validateScopes(scopes: string): boolean {
  return scopes.split(' ').every((e => VALID_SCOPES.includes(e)));
}

export function scopesMatch(scopes: string, requiredScopes: string): boolean {
  const scopesArray = scopes.split(' ');
  const requiredScopesArray = requiredScopes.split(' ');
  return requiredScopesArray.every((e => scopesArray.includes(e)));
}

export function hasScope(scopes: string, scope: string): boolean {
  return scopes.split(' ').includes(scope);
}
