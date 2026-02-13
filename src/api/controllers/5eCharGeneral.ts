import {
  get5eCharsGeneralByUserQuery,
  add5eCharGeneralQuery,
  get5eCharGeneralQuery,
  remove5eCharGeneralQuery,
  edit5eCharGeneralQuery,
  DndFiveEGeneral,
  duplicate5eCharGeneralQuery,
} from "../queries/5eCharGeneral";
import {
  add5eCharProQuery,
  get5eCharProByGeneralQuery,
  edit5eCharProQuery,
  DndFiveEPro,
  duplicate5eCharProQuery,
} from "../queries/5eCharPro";
import {
  add5eCharBackQuery,
  get5eCharBackByGeneralQuery,
  edit5eCharBackQuery,
  DndFiveEBackground,
  duplicate5eCharBackQuery,
} from "../queries/5eCharBack";
import {
  get5eCharSpellSlotInfosByGeneralQuery,
  add5eCharSpellSlotInfoQuery,
  DndFiveESpellSlots,
  duplicate5eCharSpellSlotsQuery,
} from "../queries/5eCharSpellSlots";
import { duplicate5eCharAttacksQuery } from "../queries/5eCharAttacks";
import { duplicate5eCharEquipmentsQuery } from "../queries/5eCharEquipment";
import { duplicate5eCharFeatsQuery } from "../queries/5eCharFeats";
import { duplicate5eCharSpellsQuery } from "../queries/5eCharSpells";
import { duplicate5eCharOtherProLangsQuery } from "../queries/5eCharOtherProLang";
import {
  getProjectPlayersByPlayerQuery,
  removeProjectPlayerQuery,
  addProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
} from "../queries/projectPlayers";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { Request, Response, NextFunction } from "express";
import { getProjectQuery } from "../queries/projects";
import {
  getPlayerUsersByPlayerQuery,
  removePlayerUserQuery,
} from "../queries/playerUsers";
import {
  getPlayerInviteByPlayerQuery,
  removePlayerInviteQuery,
} from "../queries/playerInvites";
import { duplicate5eCharClassesQuery } from "../queries/5eCharClasses";
import { logEventAsync, EventType } from "../../lib/eventLogger";

interface add5eCharRequest extends Request {
  body: {
    name: string;
    wyrld_id?: string;
  };
}

async function add5eChar(
  req: add5eCharRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");

    const generalId = await createNew5eChar({
      user_id: String(req.session.user),
      name: req.body.name,
    });

    // Log character creation event
    logEventAsync({
      userId: req.session.user,
      eventType: EventType.DND_5E_CHARACTER_CREATED,
      eventData: { characterId: generalId, characterName: req.body.name },
      req,
    });

    // If wyrld_id is provided, link the character to the Wyrld
    if (req.body.wyrld_id) {
      const projectPlayersData = await getProjectPlayersByProjectQuery(
        req.body.wyrld_id
      );
      if (projectPlayersData.rows.length >= 5) {
        const projectData = await getProjectQuery(req.body.wyrld_id);
        if (!projectData.rows[0].is_pro) {
          throw {
            status: 402,
            message: userSubscriptionStatus.projectIsNotPro,
          };
        }
      }

      await addProjectPlayerQuery({
        project_id: req.body.wyrld_id,
        player_id: String(generalId),
      });
      logEventAsync({
        userId: req.session.user,
        projectId: Number(req.body.wyrld_id),
        eventType: EventType.PROJECT_PLAYER_CREATED,
        eventData: { playerId: generalId, projectId: req.body.wyrld_id },
        req,
      });
      res.status(201).json({ redirect: `/wyrld?id=${req.body.wyrld_id}` });
    } else {
      res.status(201).json({ redirect: `/5eplayer?id=${generalId}` });
    }
  } catch (err) {
    next(err);
  }
}

async function createNew5eChar(data: {
  user_id: string;
  name: string;
}): Promise<number> {
  const generalData = await add5eCharGeneralQuery(data);
  const general = generalData.rows[0];
  await add5eCharProQuery({ general_id: general.id });
  await add5eCharBackQuery({ general_id: general.id });
  await add5eCharSpellSlotInfoQuery({ general_id: general.id });

  return general.id;
}

interface duplicate5eCharRequest extends Request {
  body: {
    general_id: string | number;
  };
}

async function duplicate5eChar(
  req: duplicate5eCharRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const generalData = await get5eCharGeneralQuery(req.body.general_id);
    const general = generalData.rows[0];

    // check if owner
    if (!req.session.user) throw new Error("User is not logged in");
    if (req.session.user != general.user_id)
      throw new Error("User does not own this property");

    // Duplicate
    // Gen
    const newGeneral = await duplicate5eCharGeneralQuery({
      generalId: general.id,
    });
    const newGeneralId = newGeneral.rows[0].id;
    // Pro
    await duplicate5eCharProQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Background
    await duplicate5eCharBackQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Spell slots
    await duplicate5eCharSpellSlotsQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Spells
    await duplicate5eCharSpellsQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Attacks
    await duplicate5eCharAttacksQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Equipment
    await duplicate5eCharEquipmentsQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Feats
    await duplicate5eCharFeatsQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Other pro lang
    await duplicate5eCharOtherProLangsQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });
    // Classes
    await duplicate5eCharClassesQuery({
      oldGeneralId: general.id,
      newGeneralId: newGeneralId,
    });

    res.status(201).json({ general_id: newGeneralId });
  } catch (err) {
    next(err);
  }
}

interface Get5eCharsDataReturnModel extends DndFiveEGeneral {
  proficiencies: DndFiveEPro;
  background: DndFiveEBackground;
  spell_slots: DndFiveESpellSlots;
}

async function get5eCharsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const generalsData = await get5eCharsGeneralByUserQuery(req.session.user);
    const generals = generalsData.rows;
    if (generals.length) {
      for (var general of generals) {
        const proData = await get5eCharProByGeneralQuery(general.id);
        const pro = proData.rows[0];
        const backData = await get5eCharBackByGeneralQuery(general.id);
        const back = backData.rows[0];
        const spellSlotsData = await get5eCharSpellSlotInfosByGeneralQuery(
          general.id
        );
        const spellSlots = spellSlotsData.rows[0];

        (general as Get5eCharsDataReturnModel).proficiencies = pro;
        (general as Get5eCharsDataReturnModel).background = back;
        (general as Get5eCharsDataReturnModel).spell_slots = spellSlots;
      }
    }

    res.send(generals);
  } catch (err) {
    next(err);
  }
}

async function get5eCharGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // not user
    const generalsData = await get5eCharGeneralQuery(req.params.id);
    const general = generalsData.rows[0];

    const proData = await get5eCharProByGeneralQuery(general.id);
    const pro = proData.rows[0];
    const backData = await get5eCharBackByGeneralQuery(general.id);
    const back = backData.rows[0];
    const spellSlotsData = await get5eCharSpellSlotInfosByGeneralQuery(
      general.id
    );
    const spellSlots = spellSlotsData.rows[0];

    (general as Get5eCharsDataReturnModel).proficiencies = pro;
    (general as Get5eCharsDataReturnModel).background = back;
    (general as Get5eCharsDataReturnModel).spell_slots = spellSlots;

    res.send(general);
  } catch (err) {
    next(err);
  }
}

async function remove5eChar(req: Request, res: Response, next: NextFunction) {
  try {
    const generalData = await get5eCharGeneralQuery(req.params.id);
    const general = generalData.rows[0];

    // check if owner
    if (!req.session.user) throw new Error("User is not logged in");
    if (req.session.user != general.user_id)
      throw new Error("User does not own this property");

    await remove5eCharGeneralQuery(general.id);

    const projectPlayerData = await getProjectPlayersByPlayerQuery(general.id);
    const playerUserData = await getPlayerUsersByPlayerQuery(general.id);
    const playerInviteData = await getPlayerInviteByPlayerQuery(general.id);

    await Promise.all([
      ...projectPlayerData.rows.map((pp) => removeProjectPlayerQuery(pp.id)),
      ...playerUserData.rows.map((pu) => removePlayerUserQuery(pu.id)),
      ...playerInviteData.rows.map((pi) => removePlayerInviteQuery(pi.id)),
    ]);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // get the resource
    // const generalData = await get5eCharGeneralQuery(req.params.id);
    // const general = generalData.rows[0];

    // // check if auth
    // if (!req.session.user) throw new Error("User is not logged in");
    // if (req.session.user != general.user_id) {
    //   // check playerUser
    //   const playerUserData = await getPlayerUserByUserAndPlayerQuery(
    //     req.session.user,
    //     req.params.id
    //   );
    //   if (!playerUserData.rows.length) {
    //     throw new Error("User does not have permission to this property");
    //   }
    // }

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("user_id")) {
      throw new Error('Request body cannot contain the "user_id" field');
    }

    const editData = await edit5eCharGeneralQuery(req.params.id, req.body);
    res.status(200).send(editData.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function edit5eCharPro(req: Request, res: Response, next: NextFunction) {
  try {
    // get the resource
    // const charProData = await get5eCharProQuery(req.params.id);
    // const charPro = charProData.rows[0];

    // // get the resource
    // const generalData = await get5eCharGeneralQuery(charPro.general_id);
    // const general = generalData.rows[0];

    // // check if auth
    // if (!req.session.user) throw new Error("User is not logged in");
    // if (req.session.user != general.user_id) {
    //   // check playerUser
    //   const playerUserData = await getPlayerUserByUserAndPlayerQuery(
    //     req.session.user,
    //     req.params.id
    //   );
    //   if (!playerUserData.rows.length) {
    //     throw new Error("User does not have permission to this property");
    //   }
    // }

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }

    const data = await edit5eCharProQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function edit5eCharBack(req: Request, res: Response, next: NextFunction) {
  try {
    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharBackQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  add5eChar,
  get5eCharsByUser,
  get5eCharGeneral,
  remove5eChar,
  edit5eCharGeneral,
  edit5eCharPro,
  edit5eCharBack,
  duplicate5eChar,
};
