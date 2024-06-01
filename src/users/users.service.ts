import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private usermodel: Model<UserDocument>) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.usermodel({
        ...createUserDto,
        password: hashedPassword,
      });
      return await newUser.save();
    } catch (error) {
      throw new HttpException(
        'ERROR CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await this.usermodel.findOne({ email });
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (user && isPasswordValid) {
        const { email, name } = user;
        return { email, name };
      }
      if (!isPasswordValid) {
        throw new HttpException('ERROR CREDENTIALS',HttpStatus.UNAUTHORIZED,);
      }
    } catch (error) {
      throw new HttpException(
        'ERROR CREDENTIALS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
