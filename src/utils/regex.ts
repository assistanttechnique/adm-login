// Renvoie un message d'erreur si l'expression régulière est invalide, sinon null
export function regexError(pattern: string): string | null {
  try {
    new RegExp(pattern, 'i')
    return null
  } catch (error) {
    // Le navigateur préfixe souvent déjà son message par « Invalid regular expression: »
    return error instanceof Error ? error.message.replace(/^Invalid regular expression:\s*/i, '') : 'syntax error'
  }
}

// Teste un échantillon contre l'expression (insensible à la casse, comme pour les noms de colonnes)
export function regexMatches(pattern: string, sample: string): boolean {
  return regexError(pattern) === null && new RegExp(pattern, 'i').test(sample)
}
