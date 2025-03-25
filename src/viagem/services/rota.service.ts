import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { HttpService } from "@nestjs/axios"
import { firstValueFrom } from "rxjs"
import { Viagem } from "../entities/viagem.entity"
import { Coordenadas } from "../interfaces/coordenadas.interface"

@Injectable()
export class RotaService {
	private static readonly logger = new Logger(RotaService.name)
	private static readonly OPEN_CAGE_URL =
		"https://api.opencagedata.com/geocode/v1/json?q=%s&key=%s&language=pt&format=json"
	private static readonly OSRM_URL =
		"http://router.project-osrm.org/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false"

	private static readonly INICIO_PICO_MANHA = { hours: 6, minutes: 0 }
	private static readonly FIM_PICO_MANHA = { hours: 9, minutes: 0 }
	private static readonly INICIO_PICO_TARDE = { hours: 16, minutes: 0 }
	private static readonly FIM_PICO_TARDE = { hours: 19, minutes: 0 }

	private static readonly VELOCIDADE_NORMAL = 50.0
	private static readonly VELOCIDADE_PICO_MANHA = 30.0
	private static readonly VELOCIDADE_PICO_TARDE = 35.0
	private static readonly VELOCIDADE_FINAL_SEMANA = 60.0

	private static readonly TARIFA_BASE = 5.0
	private static readonly VALOR_KM = 1.5
	private static readonly VALOR_MINUTO = 0.5
	private static readonly SEGURO = 2.0

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {}

	private async aplicarRateLimit(): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 2000))
	}

	async calcularRota(viagem: Viagem): Promise<void> {
		try {
			RotaService.logger.log(
				`Iniciando cálculo da rota para viagem de '${viagem.partida}' para '${viagem.destino}'`,
			)

			const coordenadasOrigem = await this.getCoordenadas(viagem.partida)
			const coordenadasDestino = await this.getCoordenadas(viagem.destino)

			viagem.latitudePartida = coordenadasOrigem.latitude
			viagem.longitudePartida = coordenadasOrigem.longitude
			viagem.latitudeDestino = coordenadasDestino.latitude
			viagem.longitudeDestino = coordenadasDestino.longitude

			const distanciaEmKm = await this.calcularDistanciaRota(
				coordenadasOrigem,
				coordenadasDestino,
			)
			viagem.distancia = distanciaEmKm

			const velocidadeMedia = this.calcularVelocidadeMedia(viagem.dataPartida)
			viagem.velocidadeMedia = velocidadeMedia

			const tempoMedio = this.calcularTempoMedio(distanciaEmKm, velocidadeMedia)
			viagem.tempoEstimado = tempoMedio

			const valor = this.calcularValorViagem(distanciaEmKm, tempoMedio)
			viagem.valor = Number(valor.toFixed(2))
		} catch (error) {
			RotaService.logger.error(`Erro ao calcular rota: ${error.message}`)
			throw new HttpException(
				error.message || "Erro ao calcular a rota",
				error.status || HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	private async getCoordenadas(endereco: string): Promise<Coordenadas> {
		try {
			await this.aplicarRateLimit()
			const enderecoLimpo = this.removerNumero(endereco)
			const url = RotaService.OPEN_CAGE_URL.replace(
				"%s",
				`${enderecoLimpo}, São Paulo - SP`,
			).replace("%s", this.configService.get<string>("API_KEY"))

			const { data } = await firstValueFrom(
				this.httpService.get(url, {
					headers: { "User-Agent": "ViagemApp/1.0" },
				}),
			)

			const location = data.results?.find(
				(resultado) => resultado.components?.city?.toLowerCase() === "são paulo",
			)

			if (!location) {
				throw new HttpException(
					`Endereço não encontrado: ${endereco}`,
					HttpStatus.NOT_FOUND,
				)
			}

			return {
				latitude: location.geometry.lat,
				longitude: location.geometry.lng,
			}
		} catch (error) {
			RotaService.logger.error(
				`Erro ao obter coordenadas para '${endereco}': ${error.message}`,
			)
			throw new HttpException("Erro ao buscar coordenadas", HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	private async calcularDistanciaRota(
		origem: Coordenadas,
		destino: Coordenadas,
	): Promise<number> {
		try {
			await this.aplicarRateLimit()
			const url = RotaService.OSRM_URL.replace(
				"%.6f,%.6f;%.6f,%.6f",
				`${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}`,
			)

			const { data } = await firstValueFrom(
				this.httpService.get(url, {
					headers: { "User-Agent": "ViagemApp/1.0" },
				}),
			)

			if (!data.routes?.[0]) {
				throw new HttpException("Rota não encontrada", HttpStatus.NOT_FOUND)
			}

			return data.routes[0].distance / 1000
		} catch (error) {
			RotaService.logger.error(`Erro ao calcular rota: ${error.message}`)
			throw new HttpException("Erro ao calcular rota", HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	private calcularVelocidadeMedia(dataPartida: Date): number {
		if (!dataPartida) return RotaService.VELOCIDADE_NORMAL

		const horario = new Date(dataPartida).getHours() * 60 + new Date(dataPartida).getMinutes()

		if (this.isWeekend(dataPartida)) return RotaService.VELOCIDADE_FINAL_SEMANA

		const inicioManha = RotaService.INICIO_PICO_MANHA.hours * 60
		const fimManha = RotaService.FIM_PICO_MANHA.hours * 60
		const inicioTarde = RotaService.INICIO_PICO_TARDE.hours * 60
		const fimTarde = RotaService.FIM_PICO_TARDE.hours * 60

		if (horario >= inicioManha && horario <= fimManha) return RotaService.VELOCIDADE_PICO_MANHA
		if (horario >= inicioTarde && horario <= fimTarde) return RotaService.VELOCIDADE_PICO_TARDE

		return RotaService.VELOCIDADE_NORMAL
	}

	private calcularTempoMedio(distanciaKm: number, velocidade: number): number {
		return (distanciaKm / velocidade) * 60
	}

	private calcularValorViagem(distanciaKm: number, tempoEstimado: number): number {
		return (
			RotaService.TARIFA_BASE +
			distanciaKm * RotaService.VALOR_KM +
			tempoEstimado * RotaService.VALOR_MINUTO +
			RotaService.SEGURO
		)
	}

	private isWeekend(dataHora: Date): boolean {
		return new Date(dataHora).getDay() >= 6
	}

	private removerNumero(endereco: string): string {
		const match = endereco.trim().match(/(.*?)[,\s]+\d+$/)
		return match ? match[1] : endereco
	}
}
