import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.model.js';
import { OauthApplication } from './oauth-application.model.js';
import { generateToken } from '../utils/crypto.js';

@Entity()
export class OauthAccessGrant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Index({ unique: true })
  token: string;

  @Column({ nullable: true })
  code_challenge: string;

  @Column({ nullable: true })
  code_challenge_method: string;

  @ManyToOne(() => User, (user) => user.access_grants)
  resource_owner: Relation<User>;

  @ManyToOne(() => OauthApplication, (application) => application.access_grants)
  application: Relation<OauthApplication>;

  @Column()
  redirect_uri: string;

  @Column()
  expires_in: number;

  @Column()
  scope: string = 'read';

  @BeforeInsert()
  private genToken() {
    this.token = generateToken();
  }
}
