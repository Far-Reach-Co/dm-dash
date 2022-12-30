const {
  addCharacterQuery,
  getCharactersQuery,
  getCharactersByLocationQuery,
  removeCharacterQuery,
  editCharacterQuery,
} = require("../queries/characters.js");

async function addCharacter(req, res, next) {
  try {
    const data = await addCharacterQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getCharacters(req, res, next) {
  try {
    const data = await getCharactersQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getCharactersByLocation(req, res, next) {
  try {
    const data = await getCharactersByLocationQuery(req.params.location_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeCharacter(req, res, next) {
  try {
    const data = await removeCharacterQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editCharacter(req, res, next) {
  try {
    const data = await editCharacterQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCharacters,
  getCharactersByLocation,
  addCharacter,
  removeCharacter,
  editCharacter,
};