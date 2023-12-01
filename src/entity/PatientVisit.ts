import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Patient } from "./Patient";
import { TransactionDetails } from "./TransactionDetails";
import { User } from "./User";

@Entity({ name: "patient_visit" })
export class PatientVisit extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column({ type: "integer" })
  @Generated("increment")
  session: number;

  @Column("text", { default: "PENDING" })
  status!: string;

  @ManyToOne(() => User)
  @JoinColumn()
  doctor: User;

  @ManyToOne(() => Patient, (patient) => patient.visits)
  patient: Patient;

  @ManyToOne(() => TransactionDetails)
  @JoinColumn()
  transaction: TransactionDetails;

  @Column("text")
  bodyTemp!: number;

  @Column("text")
  heartRate!: number;

  @Column("text")
  weight!: number;

  @Column("text")
  height!: number;

  @Column("text", { default: "NONE" })
  allergy: string;

  @Column("text", { default: "NONE" })
  diagnosis: string;

  @Column("text", { default: "NONE" })
  prescription: string;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
