import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DeleteResult, ILike, Repository } from "typeorm"
import { VeiculoService } from "../../veiculo/services/veiculo.service"
import { Viagem } from "../entities/viagem.entity"
import { RotaService } from "./rota.service"

@Injectable()
export class ViagemService {
	constructor(
		@InjectRepository(Viagem)
		private viagemRepository: Repository<Viagem>,
		private veiculoService: VeiculoService,
		private rotaService: RotaService,
	) {}

	async findAll(): Promise<Viagem[]> {
		return await this.viagemRepository.find({
			relations: {
				veiculo: true,
				usuario: true,
			},
		})
	}

	async findById(id: number): Promise<Viagem> {
		const buscaViagem = await this.viagemRepository.findOne({
			where: {
				id,
			},
			relations: {
				veiculo: true,
				usuario: true,
			},
		})

		if (!buscaViagem)
			throw new HttpException("A Viagem não foi encontrada!", HttpStatus.NOT_FOUND)

		return buscaViagem
	}

	async findByDestino(destino: string): Promise<Viagem[]> {
		return await this.viagemRepository.find({
			where: {
				destino: ILike(`%${destino}%`),
			},
			relations: {
				veiculo: true,
				usuario: true,
			},
		})
	}

	async create(viagem: Viagem): Promise<Viagem> {
		if (!viagem.veiculo)
			throw new HttpException(
				"Os dados do Veículo não foram informados!",
				HttpStatus.BAD_REQUEST,
			)

		await this.veiculoService.findById(viagem.veiculo.id)

		await this.rotaService.calcularRota(viagem)

		return await this.viagemRepository.save(viagem)
	}

	async update(viagem: Viagem): Promise<Viagem> {
		if (!viagem.id)
			throw new HttpException(
				"Os dados da Viagem não foram informados!",
				HttpStatus.NOT_FOUND,
			)

		await this.findById(viagem.id)

		if (!viagem.veiculo)
			throw new HttpException(
				"Os dados do Veículo não foram informados!",
				HttpStatus.BAD_REQUEST,
			)

		await this.veiculoService.findById(viagem.veiculo.id)

		await this.rotaService.calcularRota(viagem)

		return await this.viagemRepository.save(viagem)
	}

	async delete(id: number): Promise<DeleteResult> {
		await this.findById(id)

		return await this.viagemRepository.delete(id)
	}
}
