const { render, screen, waitFor } = require('../test-utils/test-utils');
const userEvent = require('@testing-library/user-event').default;
const { act } = require('@testing-library/react');
const Login = require('../pages/Login').default;

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    await act(async () => {
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/events');
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(localStorage.getItem('user')).toBeTruthy();
    });
  });

  it('handles login failure', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    await act(async () => {
      await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /sign in/i }));
    });

    expect(screen.getByLabelText(/email address/i)).toBeInvalid();
    expect(screen.getByLabelText(/password/i)).toBeInvalid();
  });
});
