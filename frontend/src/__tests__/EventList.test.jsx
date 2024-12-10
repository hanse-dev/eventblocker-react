import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils/test-utils';
import EventList from '../pages/EventList';
import { rest } from 'msw';
import { server } from '../mocks/server';

const API_URL = 'http://localhost:3000';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('EventList Component', () => {
  it('renders list of events', async () => {
    server.use(
      rest.get(`${API_URL}/api/events`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              id: 1,
              title: 'Test Event',
              description: 'Test Description',
              date: '2024-12-31T18:00:00.000Z',
              location: 'Test Location',
              capacity: 100,
              price: 50,
              bookings: []
            }
          ])
        );
      })
    );

    render(<EventList />);

    expect(await screen.findByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
    expect(screen.getByText(/test location/i)).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    server.use(
      rest.get(`${API_URL}/api/events`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: 'Error loading events' })
        );
      })
    );

    render(<EventList />);

    const errorMessage = await screen.findByText(/error loading events/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('navigates to event details when clicking on event', async () => {
    const user = userEvent.setup();
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    server.use(
      rest.get(`${API_URL}/api/events`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              id: 1,
              title: 'Test Event',
              description: 'Test Description',
              date: '2024-12-31T18:00:00.000Z',
              location: 'Test Location',
              capacity: 100,
              price: 50,
              bookings: []
            }
          ])
        );
      })
    );

    render(<EventList />);

    const viewDetailsButton = await screen.findByRole('button', { name: /view details/i });
    await user.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/events/1');
  });
});
