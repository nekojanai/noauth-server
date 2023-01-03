import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @BeforeInsert()
  private setUsername() {
    if (!this.username) {
      this.username = this.preferedUsername.replace(/[\W]/g, '').toLowerCase();
    }
  }
}
