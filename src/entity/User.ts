import "reflect-metadata";
import {
  Entity,
  Column,
  BeforeInsert,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { UserInformation } from "./UserInformation";
import * as bcrypt from "bcrypt";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column("text")
  userRole!: string;

  @Column("varchar", { length: 255 })
  email!: string;

  @Column("text")
  password!: string;

  @Column("boolean", { default: false })
  emailVerified!: boolean;

  @OneToOne(() => UserInformation, (userinformation) => userinformation.user)
  @JoinColumn()
  userInformation: UserInformation;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;

  @BeforeInsert()
  async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
