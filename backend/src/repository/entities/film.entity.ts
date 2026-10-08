import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'double precision' })
  rating: number;

  @Column()
  director: string;

  @Column({ type: 'text' })
  tags: string;

  @Column()
  image: string;

  @Column()
  cover: string;

  @Column()
  title: string;

  @Column()
  about: string;

  @Column()
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedule: Schedule[];
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  daytime: string;

  @Column()
  hall: number;

  @Column()
  rows: number;

  @Column()
  seats: number;

  @Column({ type: 'double precision' })
  price: number;

  @Column({ type: 'text' })
  taken: string;

  @ManyToOne(() => Film, (film) => film.schedule)
  @JoinColumn({ name: 'filmId' })
  film: Film;
}
