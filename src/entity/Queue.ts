import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PatientInQueue } from "./PatientInQueue";
import { User } from "./User";

@Entity("queue")
export class Queue extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => PatientInQueue, (patientinqueue) => patientinqueue.queue)
  queue: PatientInQueue[];

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
