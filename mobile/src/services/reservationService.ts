
import { USE_MOCK_DATA } from '../core/config/api';
import { request } from '../core/network/http_methods';
import { CheckoutRequest, Ticket } from '../types/booking';

export const reservationService = {
  async checkout(payload: CheckoutRequest): Promise<Ticket> {
    if (USE_MOCK_DATA) {
      throw new Error(
        'Multiple-passenger mock checkout has not been implemented yet.',
      );
    }

    return request<Ticket>('/reservations/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
