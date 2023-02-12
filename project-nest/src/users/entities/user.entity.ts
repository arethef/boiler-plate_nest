import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  AfterInsert,
  AfterUpdate,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

const saltRounds = 10;

@Entity('users')
export class User extends BaseEntity {
  // export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @VersionColumn({ default: 1 })
  version: number;

  @Column({ unique: true })
  email: string;
  @Column() // todo: bcrypt
  password: string;
  @Column({ unique: true })
  nickname: string; // todo: @nickname 처럼 쓸 ?!
  @Column({ nullable: true }) // todo: 가짜 nullable
  position: string; // 'customer' | 'brand' : 입장, 역할(?)
  @Column({ nullable: true })
  businessName?: string;
  @Column({ nullable: true })
  brn?: string; // business registration number

  @Column({ nullable: true }) // todo: 가짜 nullable -> 난주 default로 줄 것
  imageId: string;

  @Column({ nullable: true }) // todo: 가짜 nullable
  signupVerifyToken: string;
  // @Column({ nullable: true, type: 'text' }) // todo: bcrypt
  @Column({ nullable: true }) // todo: bcrypt
  @Exclude() // refresh token과 같은 민감 데이터 응답에서 제외시키기
  refreshToken?: string;

  // @BeforeUpdate()
  // @BeforeInsert()
  // @AfterInsert()
  // @AfterUpdate()
  async encryptPassword(plainPassword: string): Promise<void> {
    console.log(`[user.entity.ts] encryptPassword()`);

    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(plainPassword, salt);
      this.password = hash;
    } catch (e) {
      throw new InternalServerErrorException('비밀번호 암호화 문제 생겼다.', e);
    }
  }

  /**
   * 입력으로 들어온 플레인비밀번호를 암호화하고
   * db에 저장된 암호화된 비밀번호와 일치하는지 확인
   * @param plainPassword 입력으로 들어온 비밀번호
   * @returns 비밀번호 일치 여부, 일치:true 불일치:false
   */
  async comparePassword(plainPassword: string): Promise<boolean> {
    console.log(`[user.entity.ts] comparePassword()`);
    console.log(`plainPassword`, plainPassword);
    return await bcrypt.compare(plainPassword, this.password);
  }

  /**
   * 객체의 리프레시 토큰을 암호화하여 저장
   */
  async encryptRefreshToken(refreshToken: string): Promise<void> {
    console.log(`[user.entity.ts] encryptRefreshToken()`);
    console.log(`refershToken:`, refreshToken);

    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(refreshToken, salt);
      this.refreshToken = hash;
    } catch (e) {
      throw new InternalServerErrorException(
        '리프레시 토큰 암호화 문제 생겼다.',
        e,
      );
    }
  }

  /**
   * 입력으로 들어온 플레인리프레시토큰을 암호화하고
   * db에 저장된 암호화된 리프레시토큰과 일치하는지 확인
   * @param plainRefreshToken 입력으로 들어온 refresh token
   * @returns refresh token 일치 여부, 일치:true 불일치:false
   */
  async compareRefreshToken(plainRefreshToken: string): Promise<boolean> {
    console.log(`[user.entity.ts] compareRefreshToken()`);
    console.log(`plainRefreshToken`, plainRefreshToken);
    return await bcrypt.compare(plainRefreshToken, this.refreshToken);
  }
}
