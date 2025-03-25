import { ApiProperty } from "@nestjs/swagger"
import { Transform, TransformFnParams } from "class-transformer"
import { IsDateString, IsNotEmpty } from "class-validator"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Usuario } from "../../usuario/entities/usuario.entity"
import { NumericTransformer } from "../../util/numerictransformer"
import { Veiculo } from "../../veiculo/entities/veiculo.entity"

@Entity({ name: "tb_viagens" })
export class Viagem {
	@PrimaryGeneratedColumn()
	id: number

	@Transform(({ value }: TransformFnParams) => value?.trim())
	@IsNotEmpty()
	@Column({ length: 255, nullable: false })
	@ApiProperty()
	partida: string

	@Transform(({ value }: TransformFnParams) => value?.trim())
	@IsNotEmpty()
	@Column({ length: 255, nullable: false })
	@ApiProperty()
	destino: string

	@ApiProperty()
	@IsDateString()
	@Column({ type: "timestamp", precision: 3, nullable: false })
	dataPartida: Date

	@Column({
		type: "decimal",
		precision: 10,
		scale: 2,
		transformer: new NumericTransformer(),
	})
	@ApiProperty()
	valor: number

	@Column({ type: "float", default: 0 })
	@ApiProperty()
	distancia: number

	@Column({ type: "float", default: 0 })
	@ApiProperty()
	velocidadeMedia: number

	@Column({ type: "float", default: 0 })
	@ApiProperty()
	tempoEstimado: number

	@Column({ type: "float", default: 0 })
	@ApiProperty()
	latitudePartida: number

	@Column({ type: "float", default: 0 })
	@ApiProperty()
	longitudePartida: number

	@Column({ type: "float", default: 0 })
	@ApiProperty()
	latitudeDestino: number

	@Column({ type: "float", default: 0 })
	@ApiProperty()
	longitudeDestino: number

	@ManyToOne(() => Veiculo, (veiculo) => veiculo.viagem, {
		onDelete: "CASCADE",
	})
	@ApiProperty({ type: () => Veiculo })
	veiculo: Veiculo

	@ManyToOne(() => Usuario, (usuario) => usuario.viagem, {
		onDelete: "CASCADE",
	})
	@ApiProperty({ type: () => Usuario })
	usuario: Usuario
}
