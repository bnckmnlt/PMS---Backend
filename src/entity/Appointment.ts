import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Patient } from "./Patient";

@Entity("appointments")
export class Appointment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _apid!: string;

  @Column("text")
  schedule!: string;

  @Column("varchar", { length: 255 })
  additionalInfo!: string;

  @OneToOne(() => Patient, (patient) => patient.appointment)
  patientDetails: Patient;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
