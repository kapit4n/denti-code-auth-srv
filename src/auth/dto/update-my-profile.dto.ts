import { IsIn, IsString, ValidateIf } from 'class-validator';
import { SUPPORTED_LOCALE_CODES } from '../../locale/supported-locales';

export class UpdateMyProfileDto {
  /** Set to null to follow the organization default from AppSettings. */
  @ValidateIf(
    (o: UpdateMyProfileDto) =>
      o.preferredLocale !== undefined && o.preferredLocale !== null,
  )
  @IsString()
  @IsIn([...SUPPORTED_LOCALE_CODES])
  preferredLocale?: string | null;
}
