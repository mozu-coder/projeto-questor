import { Module } from '@nestjs/common';
import { LancamentoContabilController } from './controllers/lancamento-contabil.controller';
import { LancamentoContabilService } from './services/lancamento-contabil.service';
import { LancamentoContabilRepository } from './repositories/lancamento-contabil.repository';
import { PlanoContabilizacaoController } from './controllers/plano-contabilizacao.controller';
import { PlanoContabilizacaoService } from './services/plano-contabilizacao.service';
import { PlanoContabilizacaoRepository } from './repositories/plano-contabilizacao.repository';
import { PlanoContasController } from './controllers/plano-contas.controller';
import { PlanoContasService } from './services/plano-contas.service';
import { PlanoContasRepository } from './repositories/plano-contas.repository';
import { LancamentoFiscalController } from './controllers/lancamento-fiscal.controller';
import { LancamentoFiscalService } from './services/lancamento-fiscal.service';
import { LancamentoFiscalRepository } from './repositories/lancamento-fiscal.repository';
import { ConferenciaFiscalController } from './controllers/conferencia-fiscal.controller';
import { ConferenciaFiscalService } from './services/conferencia-fiscal.service';

@Module({
  controllers: [
    LancamentoContabilController,
    PlanoContabilizacaoController,
    PlanoContasController,
    LancamentoFiscalController,
    ConferenciaFiscalController,
  ],
  providers: [
    LancamentoContabilService,
    LancamentoContabilRepository,
    PlanoContabilizacaoService,
    PlanoContabilizacaoRepository,
    PlanoContasService,
    PlanoContasRepository,
    LancamentoFiscalService,
    LancamentoFiscalRepository,
    ConferenciaFiscalService,
  ],
  exports: [
    LancamentoContabilService,
    PlanoContabilizacaoService,
    PlanoContasService,
    LancamentoFiscalService,
    ConferenciaFiscalService,
  ],
})
export class ContabilidadeModule {}
