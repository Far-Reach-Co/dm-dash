const {
  addItemQuery,
  getItemsQuery,
  getItemsByLocationQuery,
  getItemsByCharacterQuery,
  removeItemQuery,
  editItemQuery,
} = require("../queries/items.js");

async function addItem(req, res, next) {
  try {
    const data = await addItemQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getItems(req, res, next) {
  try {
    const data = await getItemsQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getItemsByLocation(req, res, next) {
  try {
    const data = await getItemsByLocationQuery(req.params.location_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getItemsByCharacter(req, res, next) {
  try {
    const data = await getItemsByCharacterQuery(req.params.character_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const data = await removeItemQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editItem(req, res, next) {
  try {
    const data = await editItemQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getItems,
  getItemsByLocation,
  getItemsByCharacter,
  addItem,
  removeItem,
  editItem,
};