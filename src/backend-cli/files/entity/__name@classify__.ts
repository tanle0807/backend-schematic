// IMPORT LIBRARY
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { JsonProperty } from "@tsed/common";

// IMPORT CUSTOM
import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';

@Entity(addPrefix("<%= underscore(name) %>"))
export class <%= classify(name) %> extends CoreEntity {
    constructor() {
        super()
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @JsonProperty()
    field1: string

}