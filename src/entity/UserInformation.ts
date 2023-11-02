import "reflect-metadata";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Patient } from "./Patient";
import { User } from "./User";

@Entity("users_information")
export class UserInformation extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @OneToOne(() => User, (user) => user.userInformation)
  user: User;

  @Column("varchar", { length: 255 })
  firstName!: string;

  @Column("varchar", { length: 255 })
  lastName!: string;

  @Column("varchar", { length: 255 })
  middleName!: string;

  @Column("text")
  contactNumber!: string;

  @Column("text")
  specialization: string;

  @Column("text")
  schedule: string;

  @OneToMany(() => Patient, (patient) => patient.doctor)
  @JoinColumn()
  patients: Patient[];

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
