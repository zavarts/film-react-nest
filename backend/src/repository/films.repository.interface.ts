import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export const FILMS_REPOSITORY = 'FILMS_REPOSITORY';

export interface IFilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findById(id: string): Promise<FilmDto | null>;
  findScheduleByFilmId(id: string): Promise<ScheduleDto[] | null>;
  takeSeats(filmId: string, sessionId: string, seats: string[]): Promise<void>;
}
