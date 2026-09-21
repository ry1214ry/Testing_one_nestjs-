import { Controller, Get } from '@nestjs/common';
import { SvaService } from './sva.service.js';

@Controller('sva')
export class SvaController {
  constructor(private readonly svaService: SvaService) {} // inject the SvaService into the controller
  @Get()
  gotMesssage(): String {
    return this.svaService.svaMessage(); // call the service method to get the message
  }
}
