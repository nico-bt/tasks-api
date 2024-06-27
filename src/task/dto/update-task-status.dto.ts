import { IsEnum } from 'class-validator';
import { Status } from '../entities/task.entity';

export class UpdateStatusDto {
  @IsEnum(Status)
  status: Status;
}
