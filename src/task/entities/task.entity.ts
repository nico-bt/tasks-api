import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Status {
  PENDIENTE = 'pendiente',
  PROGRESO = 'en_progreso',
  COMPLETADA = 'completada',
  ELIMINADA = 'eliminada',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDIENTE,
  })
  status: Status;

  @CreateDateColumn()
  createdDate: Date;
}
