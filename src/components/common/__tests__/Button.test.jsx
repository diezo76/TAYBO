/**
 * Tests unitaires pour le composant Button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('devrait rendre un bouton avec le texte fourni', () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByText('Cliquer')).toBeInTheDocument();
  });

  it('devrait appeler onClick quand on clique', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);
    
    fireEvent.click(screen.getByText('Cliquer'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('devrait être désactivé quand disabled est true', () => {
    render(<Button disabled>Cliquer</Button>);
    const button = screen.getByText('Cliquer');
    expect(button).toBeDisabled();
  });

  it('ne devrait pas appeler onClick quand disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Cliquer</Button>);
    
    fireEvent.click(screen.getByText('Cliquer'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('devrait accepter différentes variantes', () => {
    const { rerender } = render(<Button variant="primary">Bouton</Button>);
    expect(screen.getByText('Bouton')).toBeInTheDocument();
    
    rerender(<Button variant="outline">Bouton</Button>);
    expect(screen.getByText('Bouton')).toBeInTheDocument();
  });

  it('devrait accepter différentes tailles', () => {
    const { rerender } = render(<Button size="sm">Bouton</Button>);
    expect(screen.getByText('Bouton')).toBeInTheDocument();
    
    rerender(<Button size="lg">Bouton</Button>);
    expect(screen.getByText('Bouton')).toBeInTheDocument();
  });
});

