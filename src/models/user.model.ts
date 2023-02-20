import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { OauthToken } from "./oauth_token.model.js";
import { OauthAccessGrant } from "./oauth_access_grant.model.js";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column()
  @Index({ unique: true })
  username: string;

  @Column()
  preferedUsername: string;

  @Column()
  admin: boolean = false;

  @Column()
  password: string;

  @OneToMany(() => OauthToken, token => token.resource_owner)
  tokens: Relation<OauthToken[]>;

  @OneToMany(() => OauthAccessGrant, access_grant => access_grant.resource_owner)
  access_grants: Relation<OauthAccessGrant[]>;

  @BeforeInsert()
  private setUsername() {
    if (!this.username) {
      this.username = this.preferedUsername.replace(/[\W]/g, '').toLowerCase();
    }
  }

  @BeforeInsert()
  private async createPasswordHash() {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verifyPassword(password, this.password);
  }
}
