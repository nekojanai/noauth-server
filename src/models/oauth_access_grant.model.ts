import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./user.model.js";
import { OauthApplication } from "./oauth_application.model.js";
import { generateToken } from "../utils/crypto.js";

@Entity()
export class OauthAccessGrant extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Index({ unique: true })
  token: string;

  @ManyToOne(() => User, user => user.access_grants)
  resource_owner: Relation<User>;

  @ManyToOne(() => OauthApplication, application => application.access_grants)
  application: Relation<OauthApplication>;

  @Column()
  redirect_uri: string;

  @Column()
  expires_in: number;

  @Column()
  scopes: string = 'read';

  @BeforeInsert()
  private genToken() {
    this.token = generateToken();
  }
}
