import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsuarioModule } from "../usuario/usuario.module";
import { VeiculoController } from "./controllers/veiculo.controller";
import { Veiculo } from "./entities/veiculo.entity";
import { VeiculoService } from "./services/veiculo.service";

@Module({
    imports: [TypeOrmModule.forFeature([Veiculo]), UsuarioModule],
    providers: [VeiculoService],
    controllers: [VeiculoController],
    exports: [TypeOrmModule]
})
export class VeiculoModule { }