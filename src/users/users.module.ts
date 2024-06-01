import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema, user } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    /*
    JwtModule.register({
      global: true,
      guardar jwt secret en secreto para que sea realmente seguro
      secret: 'jwt secret',
      signOptions: { expiresIn: '1d' },
    }),
    */
    MongooseModule.forFeature([{name: user.name, schema: userSchema }])],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
})
export class UsersModule {}
