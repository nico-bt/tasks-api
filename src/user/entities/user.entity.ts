import { Task } from 'src/task/entities/task.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  // Asumí que un User puede tener muchas Tasks,
  // pero que la Task puede tener sólo un User
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
