import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsuarioModule } from "../usuario/usuario.module";
import { ViagemController } from "./controllers/viagem.controller";
import { Viagem } from "./entities/viagem.entity";
import { ViagemService } from "./services/viagem.service";

@Module({
    imports: [TypeOrmModule.forFeature([Viagem]), UsuarioModule],
    providers: [ViagemService],
    controllers: [ViagemController],
    exports: [TypeOrmModule]
})

export class ViagemModule { }