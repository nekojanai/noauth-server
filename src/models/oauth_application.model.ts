import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { generateToken } from "../utils/crypto.js";
import { OauthToken } from "./oauth_token.model.js";
import { scopesMatch } from "../services/oauth-scopes.js";
import { User } from "./user.model.js";

@Entity()
export class OauthApplication extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Index({ unique: true })
  uid: string;

  @Column()
  secret: string;

  @Column()
  name: string;

  @Column()
  redirect_uri: string;

  @Column()
  scopes: string = 'read';

  @Column()
  website: string = '';

  @OneToMany(() => OauthToken, token => token.application)
  tokens: Relation<OauthToken[]>;

  async createToken(scope: string, resourceOwner?: User): Promise<OauthToken> {

    if (scopesMatch(this.scopes, scope) === false) {
      throw new Error('Requested scope is not allowed');
    }

    const token = OauthToken.create();

    if (resourceOwner) {
      token.resource_owner = resourceOwner;
    }

    token.application = this;
    token.scope = scope;
    const savedToken = await token.save();
    return savedToken;
  }

  @BeforeInsert()
  private generateUidAndSecret() {
    this.uid = generateToken();
    this.secret = generateToken();
  }
}
