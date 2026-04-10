import { IsIn, IsString } from 'class-validator';
import { SUPPORTED_LOCALE_CODES } from '../../locale/supported-locales';

export class UpdateDefaultLocaleDto {
  @IsString()
  @IsIn([...SUPPORTED_LOCALE_CODES])
  defaultLocale: string;
}
