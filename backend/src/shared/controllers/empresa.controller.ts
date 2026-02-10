import { Controller, Get } from '@nestjs/common';
import { EmpresaRepository } from '../repositories/empresa.repository';

@Controller('empresas') 
export class EmpresaController {
  constructor(private readonly empresaRepo: EmpresaRepository) {}

  @Get()
  async listar() {
    return await this.empresaRepo.listarTodas();
  }
}