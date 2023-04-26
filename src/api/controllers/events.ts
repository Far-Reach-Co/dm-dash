import {
  addEventQuery,
  getEventsQuery,
  getEventQuery,
  getEventsByLocationQuery,
  getEventsByCharacterQuery,
  getEventsByItemQuery,
  removeEventQuery,
  editEventQuery,
  getEventsByLoreQuery,
} from "../queries/events";

async function addEvent(req, res, next) {
  try {
    const data = await addEventQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getEvents(req, res, next) {
  try {
    const data = await getEventsQuery({
      projectId: req.params.project_id,
      limit: req.params.limit,
      offset: req.params.offset,
    });

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByLocation(req, res, next) {
  try {
    const data = await getEventsByLocationQuery(req.params.location_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByCharacter(req, res, next) {
  try {
    const data = await getEventsByCharacterQuery(req.params.character_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByItem(req, res, next) {
  try {
    const data = await getEventsByItemQuery(req.params.item_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByLore(req, res, next) {
  try {
    const data = await getEventsByLoreQuery(req.params.lore_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeEvent(req, res, next) {
  try {
    await removeEventQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editEvent(req, res, next) {
  try {
    const data = await editEventQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEvents,
  getEventsByLocation,
  addEvent,
  removeEvent,
  editEvent,
  getEventsByCharacter,
  getEventsByItem,
  getEventsByLore,
};
