const {
  addLocationQuery,
  getLocationsQuery,
  getLocationQuery,
  getSubLocationsQuery,
  removeLocationQuery,
  editLocationQuery,
} = require("../queries/locations.js");

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
    const data = await getLocationQuery(req.params.id);

    res.send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getLocations(req, res, next) {
  try {
    const data = await getLocationsQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
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
    const subLocations = await getSubLocationsQuery(req.params.id);
    subLocations.rows.forEach(async (location) => {
      await editLocationQuery(location.id, {
        parent_location_id: null,
        is_sub: false,
      });
    });
    const location = await removeLocationQuery(req.params.id);
    res.status(204).send();
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
