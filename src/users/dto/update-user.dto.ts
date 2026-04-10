import { IsBoolean, IsIn, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { SUPPORTED_LOCALE_CODES } from '../../locale/supported-locales';

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

  @ValidateIf(
    (o: UpdateUserDto) => o.preferredLocale !== undefined && o.preferredLocale !== null,
  )
  @IsString()
  @IsIn([...SUPPORTED_LOCALE_CODES])
  preferredLocale?: string | null;
}