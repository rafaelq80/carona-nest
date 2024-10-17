import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { Veiculo } from '../entities/veiculo.entity';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private veiculoRepository: Repository<Veiculo>,
  ) {}

  async findAll(): Promise<Veiculo[]> {
    
     return await this.veiculoRepository.find(
    {
      relations: {
        viagem: true,
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
        viagem: true,
      },
    });

    if (!veiculo)
      throw new HttpException('O Veículo não foi encontrado!', HttpStatus.NOT_FOUND);

    return veiculo;
  }

  async findByCondutor(condutor: string): Promise<Veiculo[]> {
    return await this.veiculoRepository.find({
      where: {
        condutor: ILike(`%${condutor}%`),
      },
      relations: {
        viagem: true,
      },
    });
  }

  async create(Veiculo: Veiculo): Promise<Veiculo> {
    return await this.veiculoRepository.save(Veiculo);
  }

  async update(veiculo: Veiculo): Promise<Veiculo> {
    
    await this.findById(veiculo.id);

    return await this.veiculoRepository.save(veiculo);
  }

  async delete(id: number): Promise<DeleteResult> {
    
    await this.findById(id);

    return await this.veiculoRepository.delete(id);

  }
}
