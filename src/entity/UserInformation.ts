import "reflect-metadata";
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("users_information")
export class UserInformation extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @OneToOne(() => User, (user) => user.userInformation)
  user!: User;

  @Column("text", { default: "" })
  image: string;

  @Column("varchar", { length: 255, default: "" })
  cardId: string;

  @Column("varchar", { length: 255 })
  firstName!: string;

  @Column("varchar", { length: 255 })
  lastName!: string;

  @Column("varchar", { length: 255 })
  middleName!: string;

  @Column("text")
  contactNumber!: string;

  @Column("text", { default: "NONE" })
  specialization: string;

  @Column("text", { default: "NONE" })
  schedule: string;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
