import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TransactionDetails } from "./TransactionDetails";

@Entity("payment_details")
export class PaymentDetails extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @OneToOne(
    () => TransactionDetails,
    (transaction) => transaction.paymentDetails
  )
  transactionDetails: TransactionDetails;

  @Column("text")
  subtotal: string;

  @Column("text", { default: "NONE" })
  additionalChargeDescription: string;

  @Column("text", { default: 0 })
  additionalChargeAmount: string;

  @Column("text", { default: "NONE" })
  discount: string;

  @Column("text", { default: "0" })
  total: string;

  @Column("text", { default: "0" })
  amountTendered: string;

  @Column("text", { default: "0" })
  change: string;
}
