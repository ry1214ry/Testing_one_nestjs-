import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { Auth } from './entities/auth.entity.js';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Auth)
    private readonly AuthRepository: Repository<Auth>
  ) { }

   async create(createAuthDto: CreateAuthDto): Promise<Auth> {
    const newAuth = this.AuthRepository.create(createAuthDto)
    return  await this.AuthRepository.save(newAuth)
  }
   async findAll(): Promise<Auth[]> {
    return  await  this.AuthRepository.find();
  }

  async findOne(id: number):Promise<Auth>{
    const Auth = await this.AuthRepository.findOneBy({ id })
    if (!Auth) {
      throw new NotFoundException(`Auth wiht id ${id} not foud `)
    }
    return Auth;
  }

  async  update(id: number, updateAuthDto: UpdateAuthDto){
    const auth = await this.AuthRepository.findOneBy({ id });
    if (!auth) {
      throw new NotFoundException(`auth wiht ${id} not found`)
    }
    Object.assign(auth, UpdateAuthDto);
    return await this.AuthRepository.save(auth);
  }

  async  remove(id: number): Promise<void>{
    const result = await this.AuthRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Auth with id ${id} not found`);
    }
  }
}
