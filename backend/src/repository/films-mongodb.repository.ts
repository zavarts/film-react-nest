import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Connection, Model, createConnection } from 'mongoose';
import { AppConfig } from '../app.config.provider';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import {
  FilmNotFoundError,
  SeatTakenError,
  SessionNotFoundError,
} from './films.repository.errors';
import { FilmDocument, FilmSchema } from './films.schema';
import { IFilmsRepository } from './films.repository.interface';

@Injectable()
export class FilmsMongoDbRepository implements IFilmsRepository, OnModuleInit {
  private connection: Connection;
  private filmModel: Model<FilmDocument>;

  constructor(@Inject('CONFIG') private readonly config: AppConfig) {}

  async onModuleInit() {
    this.connection = await createConnection(
      this.config.database.url,
    ).asPromise();
    this.filmModel = this.connection.model<FilmDocument>('Film', FilmSchema);
  }

  private toFilmDto(film: FilmDocument): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
      schedule: film.schedule.map((session) => this.toScheduleDto(session)),
    };
  }

  private toScheduleDto(session: {
    id: string;
    daytime: string;
    hall: number;
    rows: number;
    seats: number;
    price: number;
    taken: string[];
  }): ScheduleDto {
    return {
      id: session.id,
      daytime: session.daytime,
      hall: session.hall,
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken ?? [],
    };
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().exec();
    return films.map((film) => {
      const dto = this.toFilmDto(film);
      delete dto.schedule;
      return dto;
    });
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmModel.findOne({ id }).exec();
    return film ? this.toFilmDto(film) : null;
  }

  async findScheduleByFilmId(id: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmModel.findOne({ id }).exec();
    if (!film) {
      return null;
    }
    return film.schedule.map((session) => this.toScheduleDto(session));
  }

  async takeSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    if (!film) {
      throw new FilmNotFoundError();
    }

    const session = film.schedule.find((item) => item.id === sessionId);
    if (!session) {
      throw new SessionNotFoundError();
    }

    const taken = new Set(session.taken ?? []);
    for (const seat of seats) {
      if (taken.has(seat)) {
        throw new SeatTakenError(seat);
      }
      taken.add(seat);
    }

    session.taken = Array.from(taken);
    await film.save();
  }
}
