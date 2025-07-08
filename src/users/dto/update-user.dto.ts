import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}