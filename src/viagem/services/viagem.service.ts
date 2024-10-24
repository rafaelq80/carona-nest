import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { Viagem } from '../entities/viagem.entity';

@Injectable()
export class ViagemService {
  constructor(
    @InjectRepository(Viagem)
    private viagemRepository: Repository<Viagem>,
    private usuarioService: UsuarioService,
  ) {}

  async findAll(): Promise<Viagem[]> {
    return await this.viagemRepository.find({
      relations: {
        usuario: true,
      },
    });
  }

  async findById(id: number): Promise<Viagem> {
    let buscaViagem = await this.viagemRepository.findOne({
      where: {
        id,
      },
      relations: {
        usuario: true,
      },
    });

    if (!buscaViagem)
      throw new HttpException(
        'A Viagem não foi encontrada!',
        HttpStatus.NOT_FOUND,
      );

    return buscaViagem;
  }

  async findByDestino(destino: string): Promise<Viagem[]> {
    return await this.viagemRepository.find({
      where: {
        destino: ILike(`%${destino}%`),
      },
      relations: {
        usuario: true,
      },
    });
  }

  async create(viagem: Viagem): Promise<Viagem> {

    if (!viagem.usuario)
      throw new HttpException(
        'Os dados do Usuário não foram informados!',
        HttpStatus.BAD_REQUEST,
      );

    await this.usuarioService.findById(viagem.usuario.id);

    viagem.tempoEstimado = this.calcularTempoViagem(
      viagem.distancia,
      viagem.velocidadeMedia,
    );

    return await this.viagemRepository.save(viagem);

  }

  async update(viagem: Viagem): Promise<Viagem> {
    
    if (!viagem.id)
      throw new HttpException(
        'A Viagem não foi encontrada!',
        HttpStatus.NOT_FOUND,
      );

    await this.findById(viagem.id);

    if (!viagem.usuario)
      throw new HttpException(
       'Os dados do Usuário não foram informados!',
        HttpStatus.BAD_REQUEST,
      );

    await this.usuarioService.findById(viagem.usuario.id);

    viagem.tempoEstimado = this.calcularTempoViagem(
      viagem.distancia,
      viagem.velocidadeMedia,
    );

    return await this.viagemRepository.save(viagem);
  }

  async delete(id: number): Promise<DeleteResult> {
    
    await this.findById(id);

    return await this.viagemRepository.delete(id);
    
  }

  calcularTempoViagem(distancia: number, velocidade: number): string {
    const tempoHoras = distancia / velocidade;
    const horas = Math.floor(tempoHoras);
    const minutos = Math.round((tempoHoras - horas) * 60);

    if (horas === 0) return `${minutos} m`;
    else return `${horas} h e ${minutos} m`;
  }
}
