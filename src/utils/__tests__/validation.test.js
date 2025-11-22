/**
 * Tests unitaires pour les fonctions de validation
 * 
 * Pour exécuter : npm test
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidAmount,
  sanitizeInput,
  isValidUUID,
  isValidOrderStatus,
  rateLimiter,
} from '../validation';

describe('Validation utilities', () => {
  describe('isValidEmail', () => {
    it('devrait valider un email valide', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('devrait rejeter un email invalide', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('devrait valider un mot de passe valide', () => {
      const result = validatePassword('password123', 6);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter un mot de passe trop court', () => {
      const result = validatePassword('12345', 6);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('devrait rejeter un mot de passe vide', () => {
      const result = validatePassword('', 6);
      expect(result.valid).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('devrait valider un numéro de téléphone valide', () => {
      expect(isValidPhone('0123456789')).toBe(true);
      expect(isValidPhone('+20 1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('devrait rejeter un numéro invalide', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone(null)).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('devrait valider un montant valide', () => {
      expect(isValidAmount(10)).toBe(true);
      expect(isValidAmount('10.50')).toBe(true);
      expect(isValidAmount(0)).toBe(true);
    });

    it('devrait rejeter un montant invalide', () => {
      expect(isValidAmount(-10)).toBe(false);
      expect(isValidAmount('invalid')).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('devrait nettoyer une entrée', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
      expect(sanitizeInput('test<script>')).toBe('testscript');
      expect(sanitizeInput('<div>test</div>')).toBe('divtest/div');
    });

    it('devrait gérer les valeurs non-string', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(123)).toBe('');
    });
  });

  describe('isValidUUID', () => {
    it('devrait valider un UUID valide', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('devrait rejeter un UUID invalide', () => {
      expect(isValidUUID('invalid')).toBe(false);
      expect(isValidUUID('123')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('isValidOrderStatus', () => {
    it('devrait valider un statut valide', () => {
      expect(isValidOrderStatus('pending')).toBe(true);
      expect(isValidOrderStatus('delivered')).toBe(true);
    });

    it('devrait rejeter un statut invalide', () => {
      expect(isValidOrderStatus('invalid')).toBe(false);
      expect(isValidOrderStatus('')).toBe(false);
    });
  });

  describe('rateLimiter', () => {
    it('devrait autoriser les requêtes dans la limite', () => {
      const key = 'test-key';
      rateLimiter.reset(key);
      
      for (let i = 0; i < 10; i++) {
        expect(rateLimiter.isAllowed(key)).toBe(true);
      }
    });

    it('devrait bloquer les requêtes au-delà de la limite', () => {
      const key = 'test-key-2';
      rateLimiter.reset(key);
      
      for (let i = 0; i < 10; i++) {
        rateLimiter.isAllowed(key);
      }
      
      expect(rateLimiter.isAllowed(key)).toBe(false);
    });
  });
});

