import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PaymentDetails } from "./PaymentDetails";
import { PatientVisit } from "./PatientVisit";
import { Patient } from "./Patient";

@Entity("transactions")
export class TransactionDetails extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _tid!: string;

  @Column("text", { default: "UNPAID" })
  status!: string;

  @OneToOne(
    () => PaymentDetails,
    (paymentDetails) => paymentDetails.transactionDetails
  )
  @JoinColumn()
  paymentDetails: PaymentDetails;

  @OneToOne(() => PatientVisit, (patient) => patient.transaction)
  @JoinColumn()
  patientDetails: PatientVisit;

  @ManyToOne(() => Patient, (patient) => patient.transactions)
  patient: Patient;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
