import { Column, BaseEntity, ObjectType, ObjectID, FindOneOptions, FindConditions } from "typeorm";
import { getCurrentTimeInt } from "../../util/helper"
import { Exception } from "ts-httpexceptions";


export default class CoreEntity extends BaseEntity {

    constructor() {
        super()
    }

    save(): Promise<this> {
        if (!this.hasId()) {
            this.dateCreated = getCurrentTimeInt()
        }
        this.dateUpdated = getCurrentTimeInt()
        return super.save()
    }

    static async findOneOrThrowId<T extends BaseEntity>(this: ObjectType<T>, id?: string | number | Date | ObjectID, options?: FindOneOptions<T>): Promise<T> {
        try {
            return await super.findOneOrFail<T>(id, options)
        } catch (error) {
            console.log(error);
            throw new Exception(400, `Không tồn tại ${this.name} này`)
        }

    }

    /**
     * Finds first entity that matches given options.
     */
    static async findOneOrThrowOption<T extends BaseEntity>(this: ObjectType<T>, options?: FindOneOptions<T>): Promise<T> {
        try {
            return await super.findOneOrFail<T>(options)
        } catch (error) {
            console.log(error);
            throw new Exception(400, `Không tồn tại ${this.name} này`)
        }
    }

    /**
     * Finds first entity that matches given conditions.
     */
    static async findOneOrThrowCondition<T extends BaseEntity>(this: ObjectType<T>, conditions?: FindConditions<T>, options?: FindOneOptions<T>): Promise<T> {
        try {
            return await super.findOneOrFail<T>(conditions, options)
        } catch (error) {
            console.log(error);
            throw new Exception(400, `Không tồn tại ${this.name} này`)
        }
    }

    @Column()
    dateCreated: number;

    @Column()
    dateUpdated: number;
}
