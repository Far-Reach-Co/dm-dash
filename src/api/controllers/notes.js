const {
  addNoteQuery,
  getNotesQuery,
  getNotesByLocationQuery,
  removeNoteQuery,
  editNoteQuery,
} = require("../queries/Notes.js");

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
    const data = await getNotesQuery(req.params.project_id, req.params.type);

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
};