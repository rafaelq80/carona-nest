import { ApiProperty } from "@nestjs/swagger"
import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty, IsPositive } from "class-validator"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Usuario } from "../../usuario/entities/usuario.entity"

@Entity({name: "tb_veiculos"})
export class Veiculo {

    @PrimaryGeneratedColumn() 
    @ApiProperty() 
    id: number

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty()
    @Column({length: 255, nullable: false}) 
    @ApiProperty() 
    modelo: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty()
    @Column({length: 255, nullable: false}) 
    @ApiProperty() 
    placa: string

    @Column({length: 5000 }) 
    @ApiProperty() 
    fotoVeiculo: string

    @ManyToOne(() => Usuario, (usuario) => usuario.veiculo, {
        onDelete: "CASCADE"
    })
    @ApiProperty({ type: () => Usuario }) 
    usuario: Usuario

}