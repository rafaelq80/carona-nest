import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeiculoModule } from '../veiculo/veiculo.module';
import { ViagemController } from './controllers/viagem.controller';
import { Viagem } from './entities/viagem.entity';
import { ViagemService } from './services/viagem.service';
import { RotaService } from './services/rota.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Viagem]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VeiculoModule,
  ],
  providers: [ViagemService, RotaService],
  controllers: [ViagemController],
  exports: [TypeOrmModule],
})
export class ViagemModule {}
