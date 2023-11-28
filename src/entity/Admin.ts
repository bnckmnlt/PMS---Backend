import "reflect-metadata";
import {
  Entity,
  Column,
  BeforeInsert,
  BaseEntity,
  PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";

@Entity("admin")
export class Admin extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column("text", { default: "ADMIN" })
  role!: string;

  @Column("text")
  username!: string;

  @Column("text")
  password!: string;

  @Column("varchar", { length: 255 })
  cardId!: string;

  @Column("text", { default: new Date().toISOString() })
  createdAt!: string;

  @Column("text", { default: new Date().toISOString() })
  updatedAt!: string;

  @BeforeInsert()
  async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
