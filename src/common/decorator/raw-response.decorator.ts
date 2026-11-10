import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const RAW_RESPONSE_KEY = 'rawResponse';

export const RawResponse = (): CustomDecorator =>
  SetMetadata(RAW_RESPONSE_KEY, true);
