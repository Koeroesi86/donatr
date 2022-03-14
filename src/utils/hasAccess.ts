import {Access} from "../types";

interface HasAccessParam {
  organisationId?: string;
  locationId?: string;
  translations?: boolean;
  accesses?: boolean;
  all?: boolean;
}

const hasAccess = (condition: HasAccessParam, access: Access): boolean => {
  if (condition.all && "all" in access && access.all) {
    return true;
  }

  if (condition.accesses && "all" in access && access.all) {
    return true;
  }

  if (condition.translations && access.translations) {
    return true;
  }

  if (condition.organisationId) {
    if (("all" in access) && access.all) {
      return true;
    }
    if (("organisationIds" in access) && access.organisationIds.includes(condition.organisationId)) {
      return true;
    }
  }

  if (condition.locationId) {
    if (("all" in access) && access.all) {
      return true;
    }
    if ("locationIds" in access && access.locationIds.includes(condition.locationId)) {
      return true;
    }
  }

  return false;
}

export default hasAccess;
