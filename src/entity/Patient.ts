import "reflect-metadata";
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Appointment } from "./Appointment";
import { TransactionDetails } from "./TransactionDetails";

@Entity("patients")
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column("text", { default: "PENDING" })
  status!: string;

  @Column("varchar", { length: 255, default: "" })
  cardId: string;

  @OneToOne(() => Appointment, (appointment) => appointment.patientDetails)
  @JoinColumn()
  appointment: Appointment;

  @OneToMany(
    () => TransactionDetails,
    (transaction) => transaction.patientDetails
  )
  @JoinColumn()
  transactions: TransactionDetails[];

  @Column("text")
  doctor!: string;

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
  bodyTemp: number;

  @Column("text")
  heartRate: number;

  @Column("text")
  weight: number;

  @Column("text")
  allergy: string;

  @Column("text")
  findings: string;

  @Column("text")
  medications: string;

  @Column("text", { default: new Date().toISOString() })
  createdAt: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
