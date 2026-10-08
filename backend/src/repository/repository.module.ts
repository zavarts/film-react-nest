import { Module } from '@nestjs/common';
import { configProvider } from '../app.config.provider';
import { FilmsMongoDbRepository } from './films-mongodb.repository';
import { FILMS_REPOSITORY } from './films.repository.interface';

@Module({
  providers: [
    configProvider,
    {
      provide: FILMS_REPOSITORY,
      useClass: FilmsMongoDbRepository,
    },
  ],
  exports: [FILMS_REPOSITORY],
})
export class RepositoryModule {}
