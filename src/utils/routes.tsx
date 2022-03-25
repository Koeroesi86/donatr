import {RouteObject} from "react-router-dom";
import Home from "../components/home";
import OrganisationsRoute from "../components/organisations-route";
import OrganisationRoute from "../components/organisation-route";
import LocationsRoute from "../components/locations-route";
import LocationRoute from "../components/location-route";
import Needs from "../components/needs";
import EditRoute from "../components/edit-route";
import EditRouteLogin from "../components/edit-route-login";
import EditRouteProtected from "../components/edit-route-protected";
import NotFoundRoute from "../components/not-found-route";
import React from "react";

const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  {
    path: "/organisations",
    children: [
      { index: true, element: <OrganisationsRoute /> },
      { path: ":organisationId", element: <OrganisationRoute /> },
    ],
  },
  {
    path: "/locations",
    children: [
      { index: true, element: <LocationsRoute /> },
      { path: ":locationId", element: <LocationRoute /> },
    ],
  },
  { path: "/needs", element: <Needs /> },
  {
    path: "/edit",
    element: <EditRoute />,
    children: [
      { index: true, element: <EditRouteLogin /> },
      { path: ":code", element: <EditRouteProtected /> },
    ],
  },
  { path: "*", element: <NotFoundRoute /> }
];

export default routes;
