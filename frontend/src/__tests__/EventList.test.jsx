const { render, screen } = require('../test-utils/test-utils');
const userEvent = require('@testing-library/user-event').default;
const { rest } = require('msw');
const { server } = require('../mocks/server');
const EventList = require('../pages/EventList').default;
const { act } = require('@testing-library/react');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EventList Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('renders loading state initially', () => {
    render(<EventList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders events after loading', async () => {
    render(<EventList />);
    await screen.findByText('Test Event');

    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
  });

  it('navigates to event details when clicking on an event', async () => {
    const user = userEvent.setup();
    render(<EventList />);

    const viewDetailsLink = await screen.findByRole('link', { name: /view details/i });
    await user.click(viewDetailsLink);

    // The Link component will handle the navigation internally
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/events/1');
  });

  it('shows error message when fetch fails', async () => {
    server.use(
      rest.get('/api/events', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Error loading events' })
        );
      })
    );

    render(<EventList />);
    await screen.findByText('Error loading events');
  });

  it('shows no events message when events array is empty', async () => {
    server.use(
      rest.get('/api/events', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    render(<EventList />);
    await screen.findByText(/no events available/i);
  });
});
