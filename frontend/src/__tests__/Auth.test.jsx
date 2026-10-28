import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Auth from '../pages/user/Auth';

const authActions = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerificationCode: vi.fn(),
  loginWithFirebase: vi.fn(),
}));

vi.mock('../store', () => ({
  useStore: () => ({ ...authActions, language: 'en' }),
}));
vi.mock('../config/firebase', () => ({
  auth: {},
  googleProvider: {},
  facebookProvider: {},
  signInWithPopup: vi.fn(),
}));
vi.mock('../components/common/LanguageSwitcher', () => ({ default: () => null }));

describe('Auth form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires login inputs and does not call the API with empty values', () => {
    render(<MemoryRouter><Auth /></MemoryRouter>);

    const email = screen.getByPlaceholderText('name@example.com');
    const password = screen.getByPlaceholderText('��������');
    expect(email).toBeRequired();
    expect(password).toBeRequired();
    expect(email).toBeInvalid();
    expect(password).toBeInvalid();

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(authActions.login).not.toHaveBeenCalled();
    expect(authActions.register).not.toHaveBeenCalled();
  });

  it('switches between login and registration fields', () => {
    render(<MemoryRouter><Auth /></MemoryRouter>);

    expect(screen.queryByPlaceholderText('Your username')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'New here? Create an account' }));

    expect(screen.getByPlaceholderText('Your username')).toBeRequired();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(authActions.register).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Already registered? Sign in' }));
    expect(screen.queryByPlaceholderText('Your username')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
});
