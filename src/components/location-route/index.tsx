import React, {FC} from "react";
import {useParams} from "react-router-dom";
import Location from "../location";

const LocationRoute: FC = () => {
  let params = useParams();
  return (
    <Location id={params.locationId} open />
  )
}

export default LocationRoute;
