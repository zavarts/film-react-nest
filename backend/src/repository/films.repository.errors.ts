export class FilmNotFoundError extends Error {
  constructor(message = 'Film not found') {
    super(message);
    this.name = 'FilmNotFoundError';
  }
}

export class SessionNotFoundError extends Error {
  constructor(message = 'Session not found') {
    super(message);
    this.name = 'SessionNotFoundError';
  }
}

export class SeatTakenError extends Error {
  constructor(seat: string) {
    super(`Seat ${seat} is already taken`);
    this.name = 'SeatTakenError';
  }
}
