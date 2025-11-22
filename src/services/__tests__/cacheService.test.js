/**
 * Tests unitaires pour cacheService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import cacheService from '../cacheService';

describe('cacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  describe('generateKey', () => {
    it('devrait générer une clé unique à partir d\'un préfixe et d\'arguments', () => {
      const key1 = cacheService.generateKey('test', 'arg1', 'arg2');
      const key2 = cacheService.generateKey('test', 'arg1', 'arg2');
      const key3 = cacheService.generateKey('test', 'arg1', 'arg3');
      
      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key1).toContain('test');
    });

    it('devrait gérer les objets dans les arguments', () => {
      const key1 = cacheService.generateKey('test', { filter: 'value' });
      const key2 = cacheService.generateKey('test', { filter: 'value' });
      const key3 = cacheService.generateKey('test', { filter: 'other' });
      
      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
    });
  });

  describe('set et get', () => {
    it('devrait stocker et récupérer une valeur', () => {
      cacheService.set('test-key', 'test-value');
      const value = cacheService.get('test-key');
      expect(value).toBe('test-value');
    });

    it('devrait retourner null pour une clé inexistante', () => {
      const value = cacheService.get('non-existent-key');
      expect(value).toBeNull();
    });

    it('devrait retourner null pour une valeur expirée', async () => {
      cacheService.set('test-key', 'test-value', 100); // 100ms TTL
      expect(cacheService.get('test-key')).toBe('test-value');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cacheService.get('test-key')).toBeNull();
    });
  });

  describe('delete', () => {
    it('devrait supprimer une valeur du cache', () => {
      cacheService.set('test-key', 'test-value');
      expect(cacheService.get('test-key')).toBe('test-value');
      
      cacheService.delete('test-key');
      expect(cacheService.get('test-key')).toBeNull();
    });
  });

  describe('deleteByPrefix', () => {
    it('devrait supprimer toutes les valeurs avec un préfixe donné', () => {
      cacheService.set('prefix:key1', 'value1');
      cacheService.set('prefix:key2', 'value2');
      cacheService.set('other:key1', 'value3');
      
      cacheService.deleteByPrefix('prefix');
      
      expect(cacheService.get('prefix:key1')).toBeNull();
      expect(cacheService.get('prefix:key2')).toBeNull();
      expect(cacheService.get('other:key1')).toBe('value3');
    });
  });

  describe('clear', () => {
    it('devrait vider tout le cache', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      cacheService.clear();
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
    });
  });

  describe('getOrSet', () => {
    it('devrait retourner la valeur en cache si elle existe', async () => {
      cacheService.set('test-key', 'cached-value');
      
      const fetchFn = vi.fn(() => Promise.resolve('fetched-value'));
      const result = await cacheService.getOrSet('test-key', fetchFn);
      
      expect(result).toBe('cached-value');
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('devrait exécuter la fonction et mettre en cache si la valeur n\'existe pas', async () => {
      const fetchFn = vi.fn(() => Promise.resolve('fetched-value'));
      const result = await cacheService.getOrSet('test-key', fetchFn);
      
      expect(result).toBe('fetched-value');
      expect(fetchFn).toHaveBeenCalled();
      expect(cacheService.get('test-key')).toBe('fetched-value');
    });
  });

  describe('invalidate', () => {
    it('devrait invalider toutes les valeurs avec un préfixe donné', () => {
      cacheService.set('prefix:key1', 'value1');
      cacheService.set('prefix:key2', 'value2');
      cacheService.set('other:key1', 'value3');
      
      cacheService.invalidate('prefix');
      
      expect(cacheService.get('prefix:key1')).toBeNull();
      expect(cacheService.get('prefix:key2')).toBeNull();
      expect(cacheService.get('other:key1')).toBe('value3');
    });
  });
});

