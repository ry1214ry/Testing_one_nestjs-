import { Injectable } from '@nestjs/common';

@Injectable()
export class SvaService {
  svaMessage(): String {
    return 'Hello from SVA Service!';
  }
}
