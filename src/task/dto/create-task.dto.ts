import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  userId?: number;

  // Como se pide un servicio extra para cambiar status
  // asumo que la idea a futuro es que el user no pueda modificar el status y esto lo hará alguien más
  // Un admin o profesor?
  // Código comentado si se quisiera dejar al usuario cargar el status al crear la task
  // -----------------------
  // @IsEnum(Status)
  // @IsOptional() //Por defecto: pendiente
  // status: Status;
}
