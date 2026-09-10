import {
  IsInt,
  Min,
} from 'class-validator';
import {
  Type,
} from 'class-transformer';

export class CambiarAreaOperativaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  areaOperativaId: number;
}