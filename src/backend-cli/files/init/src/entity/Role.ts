import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { JsonProperty } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Permission } from "./Permission";
import { Staff } from "./Staff";


export enum ROLE_DEFAULT {
    admin = 1
}

@Entity(addPrefix("role"))
export class Role extends CoreEntity {
    constructor() {
        super()
    }

    @PrimaryGeneratedColumn()
    @JsonProperty()
    id: number;

    @Column()
    @JsonProperty()
    name: string;

    @Column()
    @JsonProperty()
    description: string

    // RELATIONS
    @OneToMany(() => Staff, admin => admin.role)
    staff: Staff[]

    @ManyToMany(() => Permission, permission => permission.roles)
    permissions: Permission[]

    // COMPUTES

}
