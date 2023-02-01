import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { OauthApplication } from "./oauth_application.model.js";
import { User } from "./user.model.js";

@Entity()
export class OauthToken extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  scope: string = 'read';

  @ManyToOne(() => User, user => user.tokens)
  resource_owner: Relation<User>;

  @ManyToOne(() => OauthApplication, application => application.tokens)
  application: Relation<OauthApplication>;
}
