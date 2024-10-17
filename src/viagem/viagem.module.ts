import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViagemController } from "./controllers/viagem.controller";
import { Viagem } from "./entities/viagem.entity";
import { ViagemService } from "./services/viagem.service";
import { VeiculoService } from "../veiculo/services/veiculo.service";
import { VeiculoModule } from "../veiculo/veiculo.module";

@Module({
    imports: [TypeOrmModule.forFeature([Viagem]), VeiculoModule],
    providers: [ViagemService, VeiculoService],
    controllers: [ViagemController],
    exports: [TypeOrmModule]
})

export class ViagemModule { }