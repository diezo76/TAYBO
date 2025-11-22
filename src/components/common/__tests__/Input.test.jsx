/**
 * Tests unitaires pour le composant Input
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('devrait rendre un input avec la valeur fournie', () => {
    render(<Input value="test" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();
  });

  it('devrait appeler onChange quand on tape', () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('devrait être désactivé quand disabled est true', () => {
    render(<Input value="" onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('devrait accepter un placeholder', () => {
    render(<Input value="" onChange={() => {}} placeholder="Entrez du texte" />);
    expect(screen.getByPlaceholderText('Entrez du texte')).toBeInTheDocument();
  });

  it('devrait accepter différents types', () => {
    const { rerender } = render(<Input type="text" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    rerender(<Input type="email" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

