import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import {
  FilmNotFoundError,
  SeatTakenError,
  SessionNotFoundError,
} from './films.repository.errors';
import { IFilmsRepository } from './films.repository.interface';

@Injectable()
export class FilmsPostgresRepository implements IFilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  private parseList(value: string | null | undefined): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private toScheduleDto(session: Schedule): ScheduleDto {
    return {
      id: session.id,
      daytime: session.daytime,
      hall: session.hall,
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: this.parseList(session.taken),
    };
  }

  private toFilmDto(film: Film, withSchedule = true): FilmDto {
    const dto: FilmDto = {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: this.parseList(film.tags),
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    };

    if (withSchedule) {
      dto.schedule = (film.schedule ?? []).map((session) =>
        this.toScheduleDto(session),
      );
    }

    return dto;
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find();
    return films.map((film) => this.toFilmDto(film, false));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
    });
    return film ? this.toFilmDto(film) : null;
  }

  async findScheduleByFilmId(id: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
    });
    if (!film) {
      return null;
    }
    return (film.schedule ?? []).map((session) => this.toScheduleDto(session));
  }

  async takeSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    const filmExists = await this.filmRepository.exists({
      where: { id: filmId },
    });
    if (!filmExists) {
      throw new FilmNotFoundError();
    }

    const session = await this.scheduleRepository.findOne({
      where: { id: sessionId, film: { id: filmId } },
    });
    if (!session) {
      throw new SessionNotFoundError();
    }

    const taken = new Set(this.parseList(session.taken));
    for (const seat of seats) {
      if (taken.has(seat)) {
        throw new SeatTakenError(seat);
      }
      taken.add(seat);
    }

    session.taken = Array.from(taken).join(',');
    await this.scheduleRepository.save(session);
  }
}
