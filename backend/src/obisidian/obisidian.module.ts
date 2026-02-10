import { Module, Global } from '@nestjs/common';
import { ObisidianService } from './services/obisidian.service';
import { ObisidianController } from './controllers/obisidian.controller';
import { ObisidianRepository } from './repositories/obisidian.repository';

@Global()
@Module({
  controllers: [ObisidianController],
  providers: [ObisidianService, ObisidianRepository],
  exports: [ObisidianService, ObisidianRepository],
})
export class ObisidianModule {}