// IMPORT LIBRARY
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { JsonProperty } from "@tsed/common";

// IMPORT CUSTOM
import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Role } from "./Role";

@Entity(addPrefix("staff"))
export class Staff extends CoreEntity {
    constructor() {
        super()
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @JsonProperty()
    username: string;

    @Column({ select: false })
    password: string;

    @Column()
    @JsonProperty()
    name: string;

    @Column({ default: "" })
    @JsonProperty()
    avatar: string;

    @Column()
    @JsonProperty()
    phone: string

    @Column()
    @JsonProperty()
    email: string

    @Column({ default: false })
    @JsonProperty()
    isBlock: boolean

    // RELATIONS
    @ManyToOne(type => Role, role => role.staff)
    role: Role;

    // COMPUTES

} // END FILE
