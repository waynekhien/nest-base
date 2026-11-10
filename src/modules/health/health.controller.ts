import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RawResponse } from '../../common/decorator/raw-response.decorator.js';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthService } from './health.service.js';

@ApiTags('Health')
@RawResponse()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái hoạt động của hệ thống',
    description:
      'Trả về tình trạng sống của API server, thời gian uptime và trạng thái kết nối cơ sở dữ liệu.',
  })
  @ApiOkResponse({
    description: 'Hệ thống phản hồi trạng thái thành công',
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Không thể kết nối tới cơ sở dữ liệu',
  })
  async check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
