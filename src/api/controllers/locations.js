import { getImageQuery, removeImageQuery } from "../queries/images.js";

import {
  addLocationQuery,
  getLocationsQuery,
  getLocationsWithKeywordAndFilterQuery,
  getLocationsWithKeywordQuery,
  getLocationsWithFilterQuery,
  getLocationQuery,
  getSubLocationsQuery,
  removeLocationQuery,
  editLocationQuery,
} from "../queries/locations.js";

import { getProjectQuery, editProjectQuery } from "../queries/projects.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers.js";
import { removeFile } from "./s3.js";

async function addLocation(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    const data = await addLocationQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getLocation(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get location to get project id
    const locationData = await getLocationQuery(req.params.id);
    const location = locationData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(location.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    res.send(location);
  } catch (err) {
    next(err);
  }
}

async function getLocations(req, res, next) {
  // if no user
  if (!req.user) throw { status: 401, message: "Missing Credentials" };
  // If user is not author or editor
  const projectData = await getProjectQuery(req.params.project_id);
  const project = projectData.rows[0];

  if (project.user_id !== req.user.id) {
    // not editor
    const projectUser = getProjectUserByUserAndProjectQuery(
      req.user.id,
      project.id
    );
    if (!projectUser) throw { status: 403, message: "Forbidden" };
  }

  if (req.params.keyword && req.params.filter) {
    try {
      const data = await getLocationsWithKeywordAndFilterQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        keyword: req.params.keyword,
        filter: req.params.filter,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else if (req.params.keyword && !req.params.filter) {
    try {
      const data = await getLocationsWithKeywordQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        keyword: req.params.keyword,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else if (req.params.filter && !req.params.keyword) {
    try {
      const data = await getLocationsWithFilterQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        filter: req.params.filter,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else {
    try {
      const data = await getLocationsQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  }
}

async function getSubLocations(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get location to get project id
    const locationData = await getLocationQuery(req.params.parent_location_id);
    const location = locationData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(location.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getSubLocationsQuery(req.params.parent_location_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeLocation(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get location to get project id
    const locationData = await getLocationQuery(req.params.id);
    const location = locationData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(location.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    const subLocations = await getSubLocationsQuery(req.params.id);
    subLocations.rows.forEach(async (location) => {
      await editLocationQuery(location.id, {
        parent_location_id: null,
        is_sub: false,
      });
    });

    await removeLocationQuery(req.params.id);
    res.status(204).send();

    // remove image
    if (location.image_id) {
      const imageData = await getImageQuery(location.image_id);
      const image = imageData.rows[0];
      await removeFile("wyrld/images", image);
      await removeImageQuery(image.id);
      // update project data usage
      const newCalculatedData = project.used_data_in_bytes - image.size;
      await editProjectQuery(project.id, {
        used_data_in_bytes: newCalculatedData,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function editLocation(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get location to get project id
    const locationData = await getLocationQuery(req.params.id);
    const location = locationData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(location.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );

      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    const data = await editLocationQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export default {
  getLocation,
  getLocations,
  getSubLocations,
  addLocation,
  removeLocation,
  editLocation,
};
