import "reflect-metadata";
import * as bcrypt from "bcrypt";
import {
  Entity,
  Column,
  BeforeInsert,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { UserInformation } from "./UserInformation";
import { Notification } from "./Notification";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column("text")
  userRole!: string;

  @Column("text")
  email!: string;

  @Column("text")
  password!: string;

  @Column("boolean", { default: false })
  emailVerified!: boolean;

  @Column("boolean", { default: false })
  isApproved!: boolean;

  @Column("boolean", { default: false })
  isActive!: boolean;

  @Column("boolean", { default: false })
  isBlocked!: boolean;

  @OneToOne(() => UserInformation, (userinformation) => userinformation.user)
  @JoinColumn()
  userInformation: UserInformation;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @Column("text")
  createdAt!: string;

  @Column("text")
  updatedAt!: string;

  @BeforeInsert()
  async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
