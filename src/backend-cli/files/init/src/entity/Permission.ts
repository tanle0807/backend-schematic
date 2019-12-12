import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { JsonProperty } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Role } from "./Role";

@Entity(addPrefix("permission"))
export class Permission extends CoreEntity {
    constructor() {
        super()
    }

    @PrimaryGeneratedColumn()
    @JsonProperty()
    id: number;

    @Column()
    @JsonProperty()
    path: string;

    // RELATIONS
    @ManyToMany(type => Role, role => role.permissions)
    @JoinTable()
    roles: Role[]

    // COMPUTES

}
