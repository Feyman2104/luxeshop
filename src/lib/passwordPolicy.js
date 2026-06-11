// Política de seguridad de contraseñas del proyecto:
// mínimo 10 caracteres, mayúsculas, minúsculas, números y caracteres especiales.

export const PASSWORD_REQUIREMENTS = [
  { key: 'length',    label: 'Mínimo 10 caracteres',        test: (p) => p.length >= 10 },
  { key: 'uppercase', label: 'Al menos una mayúscula (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'Al menos una minúscula (a-z)', test: (p) => /[a-z]/.test(p) },
  { key: 'number',    label: 'Al menos un número (0-9)',     test: (p) => /[0-9]/.test(p) },
  { key: 'special',   label: 'Al menos un carácter especial (!@#$%…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// Devuelve la lista de requisitos con su estado para mostrar como checklist.
export function getRequirementStatus(password) {
  return PASSWORD_REQUIREMENTS.map(({ key, label, test }) => ({
    key,
    label,
    met: test(password || ''),
  }));
}

// Devuelve '' si la contraseña cumple la política, o el mensaje de error.
export function validatePassword(password) {
  if (!password) return 'La contraseña es obligatoria.';
  const unmet = PASSWORD_REQUIREMENTS.filter(({ test }) => !test(password));
  if (unmet.length === 0) return '';
  return 'La contraseña no cumple la política de seguridad.';
}

// Puntaje 0-5 (un punto por requisito cumplido) para el medidor de fortaleza.
export function getStrength(password) {
  if (!password) return 0;
  return PASSWORD_REQUIREMENTS.filter(({ test }) => test(password)).length;
}

export const STRENGTH_LABELS = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
export const STRENGTH_COLORS = ['', 'weak', 'weak', 'medium', 'good', 'strong'];
