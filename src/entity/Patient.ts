import "reflect-metadata";
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Appointment } from "./Appointment";
import { TransactionDetails } from "./TransactionDetails";
import { User } from "./User";

@Entity("patients")
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column("text", { default: "PENDING" })
  status!: string;

  @Column("varchar", { length: 255, default: "" })
  cardId!: string;

  @OneToOne(() => Appointment, (appointment) => appointment.patientDetails)
  @JoinColumn()
  appointment: Appointment;

  @OneToMany(
    () => TransactionDetails,
    (transaction) => transaction.patientDetails
  )
  @JoinColumn()
  transactions: TransactionDetails[];

  @ManyToOne(() => User, (user) => user.userInformation.patients)
  doctor!: User;

  @Column("varchar", { length: 255 })
  firstName!: string;

  @Column("varchar", { length: 255 })
  lastName!: string;

  @Column("varchar", { length: 255 })
  middleName!: string;

  @Column("text")
  age!: number;

  @Column("text")
  contactNumber!: string;

  @Column("varchar", { length: 255 })
  emailAddress!: string;

  @Column("text")
  bodyTemp!: number;

  @Column("text")
  heartRate!: number;

  @Column("text")
  weight!: number;

  @Column("text", { default: "none" })
  allergy: string;

  @Column("text", { default: "none" })
  findings: string;

  @Column("text", { default: "none" })
  medications: string;

  @Column("text", { default: new Date().toISOString() })
  createdAt: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
