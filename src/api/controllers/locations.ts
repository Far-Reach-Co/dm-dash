const { getImageQuery, removeImageQuery } = require("../queries/images.js");
const {
  addLocationQuery,
  getLocationsQuery,
  getLocationsWithKeywordAndFilterQuery,
  getLocationsWithKeywordQuery,
  getLocationsWithFilterQuery,
  getLocationQuery,
  getSubLocationsQuery,
  removeLocationQuery,
  editLocationQuery,
} = require("../queries/locations.js");
const {
  getProjectQuery,

  editProjectQuery,
} = require("../queries/projects.js");

const { removeFile } = require("./s3.js");

async function addLocation(req, res, next) {
  try {
    const data = await addLocationQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getLocation(req, res, next) {
  try {
    const locationData = await getLocationQuery(req.params.id);
    const location = locationData.rows[0];

    res.send(location);
  } catch (err) {
    next(err);
  }
}

async function getLocations(req, res, next) {
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
    const data = await getSubLocationsQuery(req.params.parent_location_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeLocation(req, res, next) {
  try {
    const locationData = await getLocationQuery(req.params.id);
    const location = locationData.rows[0];

    const projectData = await getProjectQuery(location.project_id);
    const project = projectData.rows[0];

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
    const data = await editLocationQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLocation,
  getLocations,
  getSubLocations,
  addLocation,
  removeLocation,
  editLocation,
};
