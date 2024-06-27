import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  // Asumí que un User puede tener muchas Tasks,
  // pero que la Task puede tener sólo un User
  @ManyToOne(() => User, (user) => user.tasks, { eager: true })
  user: User;
}
