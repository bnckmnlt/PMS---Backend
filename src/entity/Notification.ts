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
import { User } from "./User";

@Entity("notifications")
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column("text")
  type!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user!: User;

  @Column("text")
  title!: string;

  @Column("text")
  description!: string;

  @OneToOne(() => Patient)
  @JoinColumn()
  payload!: Patient;

  @Column("boolean", { default: false })
  isRead!: boolean;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;
}
