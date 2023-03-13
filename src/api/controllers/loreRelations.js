import {
  addLoreRelationQuery,
  getLoreRelationQuery,
  removeLoreRelationQuery,
  editLoreRelationQuery,
  getLoreRelationsByLoreQuery,
  getLoreRelationsByLocationQuery,
  getLoreRelationsByCharacterQuery,
  getLoreRelationsByItemQuery,
} from "../queries/loreRelations.js";

async function addLoreRelation(req, res, next) {
  try {

    const data = await addLoreRelationQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelation(req, res, next) {
  try {
    const data = await getLoreRelationQuery(req.params.id);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByLore(req, res, next) {
  try {
    const data = await getLoreRelationsByLoreQuery(req.params.id, req.params.type);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByLocation(req, res, next) {
  try {
    const data = await getLoreRelationsByLocationQuery(req.params.location_id);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByCharacter(req, res, next) {
  try {
    const data = await getLoreRelationsByCharacterQuery(req.params.character_id);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByItem(req, res, next) {
  try {
    const data = await getLoreRelationsByItemQuery(req.params.item_id);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeLoreRelation(req, res, next) {
  try {

    await removeLoreRelationQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editLoreRelation(req, res, next) {
  try {
    const data = await editLoreRelationQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addLoreRelation,
  removeLoreRelation,
  editLoreRelation,
  getLoreRelation,
  getLoreRelationsByLore,
  getLoreRelationsByLocation,
  getLoreRelationsByCharacter,
  getLoreRelationsByItem
};