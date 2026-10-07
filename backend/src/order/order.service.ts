import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  FILMS_REPOSITORY,
  IFilmsRepository,
} from '../repository/films.repository.interface';
import {
  FilmNotFoundError,
  SeatTakenError,
  SessionNotFoundError,
} from '../repository/films.repository.errors';
import { OrderDto, OrderResponseDto, OrderResultDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: IFilmsRepository,
  ) {}

  async createOrder(order: OrderDto): Promise<OrderResponseDto> {
    if (!order.tickets?.length) {
      throw new BadRequestException('Tickets are required');
    }

    const seatsBySession = new Map<
      string,
      { filmId: string; sessionId: string; seats: string[] }
    >();
    const results: OrderResultDto[] = [];

    for (const ticket of order.tickets) {
      const seatKey = `${ticket.row}:${ticket.seat}`;
      const sessionKey = `${ticket.film}|${ticket.session}`;
      const sessionBooking = seatsBySession.get(sessionKey) ?? {
        filmId: ticket.film,
        sessionId: ticket.session,
        seats: [],
      };

      if (sessionBooking.seats.includes(seatKey)) {
        throw new BadRequestException(`Seat ${seatKey} is already taken`);
      }

      sessionBooking.seats.push(seatKey);
      seatsBySession.set(sessionKey, sessionBooking);

      results.push({
        id: randomUUID(),
        film: ticket.film,
        session: ticket.session,
        daytime: ticket.daytime,
        row: ticket.row,
        seat: ticket.seat,
        price: ticket.price,
      });
    }

    try {
      for (const booking of seatsBySession.values()) {
        await this.filmsRepository.takeSeats(
          booking.filmId,
          booking.sessionId,
          booking.seats,
        );
      }
    } catch (error) {
      if (
        error instanceof FilmNotFoundError ||
        error instanceof SessionNotFoundError ||
        error instanceof SeatTakenError
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    return {
      total: results.length,
      items: results,
    };
  }
}
