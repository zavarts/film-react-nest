import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configProvider } from '../app.config.provider';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsMongoDbRepository } from './films-mongodb.repository';
import { FilmsPostgresRepository } from './films-postgres.repository';
import { FILMS_REPOSITORY } from './films.repository.interface';

@Module({})
export class RepositoryModule {
  static forRoot(): DynamicModule {
    const driver = process.env.DATABASE_DRIVER ?? 'mongodb';

    if (driver === 'postgres') {
      return {
        module: RepositoryModule,
        global: true,
        imports: [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              const databaseUrl =
                configService.getOrThrow<string>('DATABASE_URL');
              const parsedUrl = new URL(databaseUrl);

              return {
                type: 'postgres' as const,
                host: parsedUrl.hostname,
                port: Number(parsedUrl.port) || 5432,
                database: parsedUrl.pathname.replace(/^\//, ''),
                username: configService.getOrThrow<string>('DATABASE_USERNAME'),
                password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
                entities: [Film, Schedule],
                synchronize: false,
              };
            },
          }),
          TypeOrmModule.forFeature([Film, Schedule]),
        ],
        providers: [
          {
            provide: FILMS_REPOSITORY,
            useClass: FilmsPostgresRepository,
          },
        ],
        exports: [FILMS_REPOSITORY],
      };
    }

    return {
      module: RepositoryModule,
      global: true,
      providers: [
        configProvider,
        {
          provide: FILMS_REPOSITORY,
          useClass: FilmsMongoDbRepository,
        },
      ],
      exports: [FILMS_REPOSITORY],
    };
  }
}
