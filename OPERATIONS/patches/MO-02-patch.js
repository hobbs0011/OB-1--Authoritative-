import * as acorn from 'acorn';

export function verify(code) {
  try {
    acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
