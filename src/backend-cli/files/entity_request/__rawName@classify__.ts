// IMPORT LIBRARY
import { JsonProperty } from "@tsed/common";

// IMPORT CUSTOM
import { Withdraw } from '../entity/Withdraw';

export class <%= classify(rawName) %> {
    // Transform to draw entity
    to<%= classify(name) %>(): <%= classify(name) %> {
        let <%= dasherize(name) %> = new <%= classify(name) %>()
        <%= dasherize(name) %>.prop = this.prop
        return <%= dasherize(name) %>
    }

    @JsonProperty()
    prop: string
    
} // END FILE
