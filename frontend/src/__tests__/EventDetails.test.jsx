import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils/test-utils';
import EventDetails from '../pages/EventDetails';
import { rest } from 'msw';
import { server } from '../mocks/server';

const API_URL = 'http://localhost:3000';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

describe('EventDetails Component', () => {
  it('renders event details', async () => {
    server.use(
      rest.get(`${API_URL}/api/events/1`, (req, res, ctx) => {
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
            bookings: []
          })
        );
      })
    );

    render(<EventDetails />);

    expect(await screen.findByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
    expect(screen.getByText(/test location/i)).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('redirects to login for unauthenticated user', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    server.use(
      rest.get(`${API_URL}/api/events/1`, (req, res, ctx) => {
        return res(ctx.status(401));
      })
    );

    render(<EventDetails />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles successful booking', async () => {
    const user = userEvent.setup();
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    server.use(
      rest.get(`${API_URL}/api/events/1`, (req, res, ctx) => {
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
            bookings: []
          })
        );
      }),
      rest.post(`${API_URL}/api/bookings`, (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            id: 1,
            eventId: 1,
            userId: 1,
            status: 'confirmed'
          })
        );
      })
    );

    render(<EventDetails />);

    const bookButton = await screen.findByRole('button', { name: /book now/i });
    await user.click(bookButton);

    expect(await screen.findByText(/booking confirmed/i)).toBeInTheDocument();
  });

  it('handles booking error gracefully', async () => {
    const user = userEvent.setup();

    server.use(
      rest.get(`${API_URL}/api/events/1`, (req, res, ctx) => {
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
            bookings: []
          })
        );
      }),
      rest.post(`${API_URL}/api/bookings`, (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ message: 'Failed to book event' })
        );
      })
    );

    render(<EventDetails />);

    const bookButton = await screen.findByRole('button', { name: /book now/i });
    await user.click(bookButton);

    expect(await screen.findByText(/failed to book event/i)).toBeInTheDocument();
  });
});
