import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

type Tokens = {
  access_token: string;
  refresh_token: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usermodel: Model<UserDocument>,
    private jwtSvc: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.usermodel({
        ...createUserDto,
        password: hashedPassword,
      });
      return await newUser.save();
    } catch (error) {
      throw new HttpException('ERROR CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await this.usermodel.findOne({ email });
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (user && isPasswordValid) {
        const payload = { sub: user._id, email: user.email, name: user.name };
        return {
          access_token: await this.jwtSvc.signAsync(payload, {
            secret: 'jwt_secret',
            expiresIn: '1d',
          }),
          refresh_token: await this.jwtSvc.signAsync(payload, {
            secret: 'jwt_secret_refresh',
            expiresIn: '7d',
          }),
          message: 'login succesful',
        };
      }
      if (!isPasswordValid) {
        throw new HttpException('ERROR CREDENTIALS', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      throw new HttpException('ERROR CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const user = this.jwtSvc.verify(refreshToken, {
        secret: 'jwt_secret_refresh',
      });
      const payload = { sub: user._id, email: user.email, name: user.name };
      const { access_token, refresh_token } =
        await this.generateTokens(payload);
      return {
        access_token,
        refresh_token,
        status: 200,
        menssage: 'refesh token successfully',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('ERROR desconocido', HttpStatus.UNAUTHORIZED);
    }
  }

  private async generateTokens(user): Promise<Tokens> {
    const jwtPayload = { sub: user._id, email: user.email, name: user.name };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtSvc.signAsync(jwtPayload, {
        secret: 'jwt_secret',
        expiresIn: '1d',
      }),
      this.jwtSvc.signAsync(jwtPayload, {
        secret: 'jwt_secret_refresh',
        expiresIn: '1d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
