import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Patient } from "./Patient";
import { PatientVisit } from "./PatientVisit";

@Entity("appointments")
export class Appointment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _apid!: string;

  @Column("text")
  schedule!: string;

  @ManyToOne(() => Patient, (patient) => patient.appointment)
  patientDetails: Patient;

  @OneToOne(() => PatientVisit)
  @JoinColumn()
  visitDetail: PatientVisit;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
