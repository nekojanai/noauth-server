import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { generateToken } from "../utils/crypto.js";
import { OauthToken } from "./oauth_token.model.js";
import { scopesMatch } from "../services/oauth-scopes.js";
import { User } from "./user.model.js";
import { OauthAccessGrant } from "./oauth_access_grant.model.js";

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

  @OneToMany(() => OauthAccessGrant, access_grant => access_grant.application)
  access_grants: Relation<OauthAccessGrant[]>;

  async createAccessGrant(scope: string, redirectUri: string, resourceOwner: User): Promise<OauthAccessGrant> {

    if (scopesMatch(this.scopes, scope) === false) {
      throw new Error('Requested scope is not allowed');
    }

    if (!resourceOwner) {
      throw new Error('Resource owner is required');
    }

    if (redirectUri !== this.redirect_uri) {
      throw new Error('Redirect uri does not match');
    }

    const accessGrant = OauthAccessGrant.create();
    accessGrant.resource_owner = resourceOwner;
    accessGrant.application = this;
    accessGrant.redirect_uri = this.redirect_uri;
    accessGrant.scopes = scope;
    const savedAccessGrant = await accessGrant.save();
    return savedAccessGrant;
  }

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
