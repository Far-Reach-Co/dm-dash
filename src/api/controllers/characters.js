const {
  addCharacterQuery,
  getCharactersQuery,
  getCharactersWithFilterQuery,
  getCharactersWithKeywordQuery,
  getCharactersWithKeywordAndFilterQuery,
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
  if(req.params.keyword && req.params.filter) {
    try {
      const data = await getCharactersWithKeywordAndFilterQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        keyword: req.params.keyword,
        filter: req.params.filter
      });
  
      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else if(req.params.keyword && !req.params.filter) {
    try {
      const data = await getCharactersWithKeywordQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        keyword: req.params.keyword,
      });
  
      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else if(req.params.filter && !req.params.keyword) {
    try {
      const data = await getCharactersWithFilterQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        filter: req.params.filter
      });
  
      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else {
    try {
      const data = await getCharactersQuery({
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
  getCharactersWithFilterQuery,
  getCharactersWithKeywordQuery,
  getCharactersWithKeywordAndFilterQuery,
  getCharactersByLocation,
  addCharacter,
  removeCharacter,
  editCharacter,
};