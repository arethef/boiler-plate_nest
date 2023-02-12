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
      throw new NotFoundException('사용자를 찾을 수 없다.');
    }
  }

  async findOneByUserEmail(email: string): Promise<User | void> {
    const user: User = await User.findOne({
      where: { email },
    });
    // if (!user) {
    //   throw new HttpException(
    //     '이메일로 사용자를 찾을 수 없다.',
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
    //     '닉네임으로 사용자를 찾을 수 없다.',
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
    //     '아이디로 사용자를 찾을 수 없다.',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    return user;
  }

  /**
   * 발급받은 refresh token을 암호화해서 db에 저장
   * @param refreshToken 발급받은 refresh token
   * @param id 사용자 id
   */
  async saveRefreshTokenWithUserId(id: string, refreshToken: string) {
    console.log(`[users.service.ts] saveRefreshTokenWithUserId()`);
    console.log(`id:`, id, `, refreshToken: `, refreshToken);

    const user: User = await User.findOne({ where: { id } });
    await user.encryptRefreshToken(refreshToken);
    await User.save(user);
  }

  /**
   * 사용자의 id를 이용해 데이터를 조회하고
   * refresh token이 유효한지 확인
   * @param id 사용자 id
   * @param refreshToken 유효한지 검증할 refresh token
   * @returns refresh token이 일치한다면 사용자 정보 반환
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
      throw new HttpException('리프레시 토큰 다르다.', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * refresh token의 값을 null로 만든다
   * 사용자가 로그아웃 할 때 쓴다
   * @param id 사용자 id
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
