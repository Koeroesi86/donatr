import {GeoLocationResource, LocationResource} from "../types";

const hasGeoLocation = (resource: LocationResource): resource is GeoLocationResource => !!resource.location;

export default hasGeoLocation;
