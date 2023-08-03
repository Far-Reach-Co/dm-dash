import {
  addLoreQuery,
  getLoresQuery,
  getLoreQuery,
  getLoresWithFilterQuery,
  getLoresWithKeywordQuery,
  getLoresWithKeywordAndFilterQuery,
  removeLoreQuery,
  editLoreQuery,
} from "../queries/lores.js";
import { getProjectQuery, editProjectQuery } from "../queries/projects.js";
import { removeImage } from "./s3.js";
import { removeImageQuery, getImageQuery } from "../queries/images.js";
import { Request, Response, NextFunction } from "express";

async function addLore(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addLoreQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getLore(req: Request, res: Response, next: NextFunction) {
  try {
    const loreData = await getLoreQuery(req.params.id);
    const lore = loreData.rows[0];

    res.send(lore);
  } catch (err) {
    next(err);
  }
}

async function getLores(req: Request, res: Response, next: NextFunction) {
  if (req.params.keyword && req.params.filter) {
    try {
      const data = await getLoresWithKeywordAndFilterQuery({
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
      const data = await getLoresWithKeywordQuery({
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
      const data = await getLoresWithFilterQuery({
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
      const data = await getLoresQuery({
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

async function removeLore(req: Request, res: Response, next: NextFunction) {
  try {
    // get Lore to get project id
    const LoreData = await getLoreQuery(req.params.id);
    const Lore = LoreData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(Lore.project_id);
    const project = projectData.rows[0];

    const data = await removeLoreQuery(req.params.id);
    res.status(204).send();

    // remove image
    if (Lore.image_id) {
      const imageData = await getImageQuery(Lore.image_id);
      const image = imageData.rows[0];
      await removeImage("wyrld/images", image);
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

async function editLore(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editLoreQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getLore, getLores, addLore, removeLore, editLore };
