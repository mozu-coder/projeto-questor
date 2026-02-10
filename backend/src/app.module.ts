import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestorModule } from './questor/questor.module';
import { ObisidianModule } from './obisidian/obisidian.module';
import { SharedModule } from './shared/shared.module';
import { ContabilidadeModule } from './contabilidade/contabilidade.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('OBISIDIAN_HOST'),
        port: configService.get<number>('OBISIDIAN_PORT'),
        username: configService.get<string>('OBISIDIAN_USER'),
        password: configService.get<string>('OBISIDIAN_PASS'),
        database: configService.get<string>('OBISIDIAN_NAME'),
        entities: [],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    QuestorModule,
    ObisidianModule,
    SharedModule,
    ContabilidadeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}