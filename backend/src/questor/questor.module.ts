import { Module, Global } from '@nestjs/common'; 
import { QuestorService } from './services/questor.services';
import { QuestorController } from './controllers/questor.controller';
import { QuestorRepository } from './repositories/questor.repository';

@Global() 
@Module({
  controllers: [QuestorController],
  providers: [QuestorService, QuestorRepository],
  exports: [QuestorService, QuestorRepository],
})
export class QuestorModule {}