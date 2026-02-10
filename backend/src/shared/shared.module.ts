import { Module } from '@nestjs/common';
import { EmpresaRepository } from './repositories/empresa.repository';
import { EmpresaController } from './controllers/empresa.controller';
import { QuestorModule } from '../questor/questor.module'; 

@Module({
  imports: [QuestorModule],
  controllers: [EmpresaController],
  providers: [EmpresaRepository],
  exports: [EmpresaRepository]
})
export class SharedModule {}