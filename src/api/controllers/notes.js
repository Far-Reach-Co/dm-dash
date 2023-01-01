const {
  addNoteQuery,
  getNotesQuery,
  getNotesByLocationQuery,
  getNotesByCharacterQuery,
  getNotesByItemQuery,
  removeNoteQuery,
  editNoteQuery,
} = require("../queries/notes.js");

async function addNote(req, res, next) {
  try {
    const data = await addNoteQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getNotes(req, res, next) {
  try {
    const data = await getNotesQuery(
      req.params.project_id,
      req.params.limit,
      req.params.offset,
      req.params.keyword
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByLocation(req, res, next) {
  try {
    const data = await getNotesByLocationQuery(req.params.location_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByCharacter(req, res, next) {
  try {
    const data = await getNotesByCharacterQuery(req.params.character_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByItem(req, res, next) {
  try {
    const data = await getNotesByItemQuery(req.params.item_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeNote(req, res, next) {
  try {
    const data = await removeNoteQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editNote(req, res, next) {
  try {
    const data = await editNoteQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotes,
  getNotesByLocation,
  addNote,
  removeNote,
  editNote,
  getNotesByCharacter,
  getNotesByItem,
};
