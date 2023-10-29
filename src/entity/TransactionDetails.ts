import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PaymentDetails } from "./PaymentDetails";
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

  @ManyToOne(() => Patient, (patient) => patient.transactions)
  @JoinColumn()
  patientDetails: Patient;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
