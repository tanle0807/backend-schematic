import googleMap, { LatLng } from "@google/maps";
import { Exception } from "ts-httpexceptions";
import logger from "./logger";

export let googleMapsClient = googleMap.createClient({
    key: 'AIzaSyCArKIzbQ-Sb8B6ldtZD9LUzZVCZenWGv0',
    Promise: Promise
})


export const getDistanceByGoogleMap = async (start: LatLng, end: LatLng): Promise<number> => {
    try {
        //call google map
        let result = await googleMapsClient.distanceMatrix({
            origins: [start],
            destinations: [end]
        }).asPromise()
        //check data response
        console.log(result.json);

        if (!result.json.rows[0] || !result.json.rows[0].elements
            || !result.json.rows[0].elements[0] || result.json.rows[0].elements[0].status != "OK") {
            logger('error').error("Error google map", result.json.rows)
            throw new Exception(500, "Lỗi google map! Vui lòng thử lại sau")
        }
        //return distance
        let distance = result.json.rows[0].elements[0].distance.value / 1000
        return distance
    } catch (error) {
        logger('error').error("Error google map", error)
        throw new Exception(500, "Lỗi google map! Vui lòng thử lại sau")
    }
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export function calDistance2Coordinates(lat1: number, lon1: number, lat2: number, lon2: number, unit: string = "K"): number {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}