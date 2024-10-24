import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { Veiculo } from '../entities/veiculo.entity';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private veiculoRepository: Repository<Veiculo>,
    private usuarioService: UsuarioService,
  ) {}

  async findAll(): Promise<Veiculo[]> {
    
     return await this.veiculoRepository.find(
    {
      relations: {
        usuario: true,
      },
    }
    );
  }

  async findById(id: number): Promise<Veiculo> {

    let veiculo = await this.veiculoRepository.findOne({
      where: {
        id,
      },
      relations: {
        usuario: true,
      },
    });

    if (!veiculo)
      throw new HttpException('O Veículo não foi encontrado!', HttpStatus.NOT_FOUND);

    return veiculo;
  }

  async findByModelo(modelo: string): Promise<Veiculo[]> {
    return await this.veiculoRepository.find({
      where: {
        modelo: ILike(`%${modelo}%`),
      },
      relations: {
        usuario: true,
      },
    });
  }

  async create(veiculo: Veiculo): Promise<Veiculo> {

    if (!veiculo.usuario)
      throw new HttpException(
        'Os dados do Usuário não foram informados!',
        HttpStatus.BAD_REQUEST,
      );

    await this.usuarioService.findById(veiculo.usuario.id);

    return await this.veiculoRepository.save(veiculo);

  }

  async update(veiculo: Veiculo): Promise<Veiculo> {
    
     if (!veiculo.id)
      throw new HttpException(
        'Os dados do Veículo não foram informados!',
        HttpStatus.NOT_FOUND,
      );

    await this.findById(veiculo.id);

    if (!veiculo.usuario)
      throw new HttpException(
        'Os dados do Usuário não foram informados!',
        HttpStatus.BAD_REQUEST,
      );

    await this.usuarioService.findById(veiculo.usuario.id);

    return await this.veiculoRepository.save(veiculo);
  }

  async delete(id: number): Promise<DeleteResult> {
    
    await this.findById(id);

    return await this.veiculoRepository.delete(id);

  }
}
