import { describe, it, expect, beforeEach } from 'vitest';
import { formatearCLP, leerStorage, guardarStorage } from './format.js';

describe('formatearCLP', () => {
  it('formatea un número como pesos chilenos sin decimales', () => {
    expect(formatearCLP(29990)).toContain('29.990');
  });
});

describe('localStorage helpers', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve el valor por defecto si la clave no existe', () => {
    expect(leerStorage('no-existe', [])).toEqual([]);
  });

  it('guarda y lee un valor', () => {
    guardarStorage('clave', { a: 1 });
    expect(leerStorage('clave', null)).toEqual({ a: 1 });
  });
});
