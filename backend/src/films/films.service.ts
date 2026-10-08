import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FILMS_REPOSITORY,
  IFilmsRepository,
} from '../repository/films.repository.interface';
import { FilmDto, FilmsListDto, ScheduleListDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: IFilmsRepository,
  ) {}

  async findAll(): Promise<FilmsListDto> {
    const items = await this.filmsRepository.findAll();
    return {
      total: items.length,
      items,
    };
  }

  async findOne(id: string): Promise<FilmDto> {
    const film = await this.filmsRepository.findById(id);
    if (!film) {
      throw new NotFoundException('Film not found');
    }
    return film;
  }

  async findSchedule(id: string): Promise<ScheduleListDto> {
    const items = await this.filmsRepository.findScheduleByFilmId(id);
    if (!items) {
      throw new NotFoundException('Film not found');
    }
    return {
      total: items.length,
      items,
    };
  }
}
