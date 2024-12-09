const { render, screen, within } = require('../test-utils/test-utils');
const userEvent = require('@testing-library/user-event').default;
const { rest } = require('msw');
const { server } = require('../mocks/server');
const EventDetails = require('../pages/EventDetails').default;
const { act } = require('@testing-library/react');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

describe('EventDetails Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('renders loading state initially', () => {
    render(<EventDetails />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders event details after loading', async () => {
    render(<EventDetails />);

    const title = await screen.findByRole('heading', { name: 'Test Event', level: 1 });
    expect(title).toBeInTheDocument();

    // Event details
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
    expect(screen.getByText(/test location/i)).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument();

    // Capacity information
    const capacitySection = screen.getByRole('heading', { name: 'Capacity', level: 2 }).closest('div');
    const capacityContainer = within(capacitySection).getByText(/total capacity/i).closest('p');
    expect(capacityContainer).toHaveTextContent('100');
    
    const availableContainer = within(capacitySection).getByText(/available/i).closest('p');
    expect(availableContainer).toHaveTextContent('100');
  });

  it('handles booking when user is logged in', async () => {
    localStorage.setItem('token', 'fake-token');
    const user = userEvent.setup();
    render(<EventDetails />);

    const title = await screen.findByRole('heading', { name: 'Test Event', level: 1 });
    expect(title).toBeInTheDocument();

    const bookButton = screen.getByRole('button', { name: /book now/i });
    await user.click(bookButton);

    const successMessage = await screen.findByText(/booking successful/i);
    expect(successMessage).toBeInTheDocument();
  });

  it('redirects to login when booking without being logged in', async () => {
    const user = userEvent.setup();
    render(<EventDetails />);

    const title = await screen.findByRole('heading', { name: 'Test Event', level: 1 });
    expect(title).toBeInTheDocument();

    const bookButton = screen.getByRole('button', { name: /book now/i });
    await user.click(bookButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows error message when fetch fails', async () => {
    server.use(
      rest.get('/api/events/:id', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Error loading event' }));
      })
    );

    render(<EventDetails />);
    const errorMessage = await screen.findByText(/error loading event/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('shows sold out state when event is at capacity', async () => {
    server.use(
      rest.get('/api/events/:id', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: 1,
            title: 'Test Event',
            description: 'Test Description',
            date: '2024-12-31T18:00:00.000Z',
            location: 'Test Location',
            capacity: 100,
            price: 50,
            bookings: Array(100).fill({ id: 1 }) // Fill bookings to capacity
          })
        );
      })
    );

    render(<EventDetails />);
    
    const title = await screen.findByRole('heading', { name: 'Test Event', level: 1 });
    expect(title).toBeInTheDocument();

    const bookButton = screen.getByRole('button', { name: /sold out/i });
    expect(bookButton).toBeDisabled();
  });

  it('handles booking error gracefully', async () => {
    localStorage.setItem('token', 'fake-token');
    server.use(
      rest.post('/api/bookings', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Event is fully booked' })
        );
      })
    );

    const user = userEvent.setup();
    render(<EventDetails />);

    const title = await screen.findByRole('heading', { name: 'Test Event', level: 1 });
    expect(title).toBeInTheDocument();

    const bookButton = screen.getByRole('button', { name: /book now/i });
    await user.click(bookButton);

    const errorMessage = await screen.findByText(/event is fully booked/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('navigates back to event list when clicking back button', async () => {
    const user = userEvent.setup();
    render(<EventDetails />);

    const title = await screen.findByRole('heading', { name: 'Test Event', level: 1 });
    expect(title).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /back to events/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/events');
  });
});
