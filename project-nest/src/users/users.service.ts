import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ReqSignupUserDto } from './dto/req-signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createNewUser(dto: ReqSignupUserDto): Promise<void | User> {
    const user: User = new User();
    const {
      email,
      password,
      nickname,
      position,
      imageId,
      signupVerifyToken,
      refreshToken,
    } = dto;
    user.email = email;
    // user.password = password;
    await user.encryptPassword(password);
    user.nickname = nickname;
    user.position = position;
    user.imageId = imageId;
    user.signupVerifyToken = signupVerifyToken;
    user.refreshToken = refreshToken;
    const result = await User.save(user);
    // const result = await User.save({ ...dto });
    // const result = await this.usersRepository.save({ ...dto });
    return result;
  }

  async findOneByUserEmailOrNickname(
    emailOrNickname: string,
  ): Promise<User | void> {
    // const resultByEmail: User = await User.findOne({
    //   where: {
    //     email: emailOrNickname,
    //   },
    // });
    // const resultByNickname: User = await User.findOne({
    //   where: {
    //     nickname: emailOrNickname,
    //   },
    // });
    const resultByEmail: User | void = await this.findOneByUserEmail(
      emailOrNickname,
    );
    const resultByNickname: User | void = await this.findOneByUserNickname(
      emailOrNickname,
    );
    console.log(`[users.service.ts] findOneByUserEmailOrNickname()`);
    console.log(`emailOrNickname:`, emailOrNickname);

    console.log(`resultByEmail:`, resultByEmail);
    console.log(`resultByNickname:`, resultByNickname);

    if (resultByEmail) {
      return resultByEmail;
    } else if (resultByNickname) {
      return resultByNickname;
    } else {
      throw new NotFoundException('???????????? ?????? ??? ??????.');
    }
  }

  async findOneByUserEmail(email: string): Promise<User | void> {
    const user: User = await User.findOne({
      where: { email },
    });
    // if (!user) {
    //   throw new HttpException(
    //     '???????????? ???????????? ?????? ??? ??????.',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    return user;
  }
  async findOneByUserNickname(nickname: string): Promise<User | void> {
    const user: User = await User.findOne({
      where: { nickname },
    });
    // if (!user) {
    //   throw new HttpException(
    //     '??????????????? ???????????? ?????? ??? ??????.',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    return user;
  }
  async findOneByUserId(id: string): Promise<User | void> {
    const user: User = await User.findOne({
      where: { id },
    });
    // if (!user) {
    //   throw new HttpException(
    //     '???????????? ???????????? ?????? ??? ??????.',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    return user;
  }

  /**
   * ???????????? refresh token??? ??????????????? db??? ??????
   * @param refreshToken ???????????? refresh token
   * @param id ????????? id
   */
  async saveRefreshTokenWithUserId(id: string, refreshToken: string) {
    console.log(`[users.service.ts] saveRefreshTokenWithUserId()`);
    console.log(`id:`, id, `, refreshToken: `, refreshToken);

    const user: User = await User.findOne({ where: { id } });
    await user.encryptRefreshToken(refreshToken);
    await User.save(user);
  }

  /**
   * ???????????? id??? ????????? ???????????? ????????????
   * refresh token??? ???????????? ??????
   * @param id ????????? id
   * @param refreshToken ???????????? ????????? refresh token
   * @returns refresh token??? ??????????????? ????????? ?????? ??????
   */
  async findUserByIdAndRefreshToken(id: string, refreshToken: string) {
    console.log(`[users.service.ts] findUserByIdAndRefreshToken()`);
    const user: User = await User.findOne({ where: { id } });
    console.log(
      `refreshToken: `,
      refreshToken,
      `, user.refreshToken:`,
      user.refreshToken,
    );

    const isRefreshTokenMatch = await user.compareRefreshToken(refreshToken);
    if (isRefreshTokenMatch) {
      return user;
    } else {
      throw new HttpException('???????????? ?????? ?????????.', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * refresh token??? ?????? null??? ?????????
   * ???????????? ???????????? ??? ??? ??????
   * @param id ????????? id
   */
  async removeRefreshTokenById(id: string) {
    console.log(`[users.service.ts] removeRefreshTokenById id:`, id);

    const user: User = await User.findOne({ where: { id } });
    user.refreshToken = null;
    await User.save(user);
  }

  /* provided methods */
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll(): Promise<User[]> {
    // return User.find();
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    // return User.findOne({ where: { id } });
    return this.usersRepository.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string): Promise<void> {
    // await User.delete(id);
    await this.usersRepository.delete(id);
  }
}
