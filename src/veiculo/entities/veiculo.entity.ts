import { ApiProperty } from "@nestjs/swagger"
import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Viagem } from "../../viagem/entities/viagem.entity"

@Entity({name: "tb_veiculos"})
export class Veiculo {

    @PrimaryGeneratedColumn() 
    @ApiProperty() 
    id: number

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty()
    @Column({length: 255, nullable: false}) 
    @ApiProperty() 
    condutor: string

    @Column({length: 5000 }) 
    @ApiProperty() 
    fotoCondutor: string

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

    @OneToMany(() => Viagem, (viagem) => viagem.veiculo)
    @ApiProperty() 
    viagem: Viagem[]

}