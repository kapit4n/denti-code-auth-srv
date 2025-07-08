import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsString()
  @Length(0, 255)
  description?: string;
}
