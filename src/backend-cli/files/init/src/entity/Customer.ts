// IMPORT LIBRARY
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { JsonProperty } from "@tsed/common";

// IMPORT CUSTOM
import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import md5 from "md5";
import moment from "moment";

@Entity(addPrefix("customer"))
export class Customer extends CoreEntity {
    constructor() {
        super()
    }

    @PrimaryGeneratedColumn()
    id: number;

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

    @Column({ default: '' })
    @JsonProperty()
    email: string

    @Column()
    @JsonProperty()
    code: string

    @Column({ default: '' })
    @JsonProperty()
    address: string

    @Column({ default: false })
    @JsonProperty()
    isBlock: boolean

    // RELATIONS

    // COMPUTES

} // END FILE
