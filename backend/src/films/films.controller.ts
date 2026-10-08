import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsListDto, ScheduleListDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  getFilms(): Promise<FilmsListDto> {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  getFilmSchedule(@Param('id') id: string): Promise<ScheduleListDto> {
    return this.filmsService.findSchedule(id);
  }
}
