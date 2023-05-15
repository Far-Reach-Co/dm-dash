import {
  get5eCharsGeneralByUserQuery,
  add5eCharGeneralQuery,
  get5eCharGeneralQuery,
  remove5eCharGeneralQuery,
  edit5eCharGeneralQuery,
} from "../queries/5eCharGeneral";
import {
  get5eCharProQuery,
  add5eCharProQuery,
  get5eCharProByGeneralQuery,
  remove5eCharProQuery,
  edit5eCharProQuery,
} from "../queries/5eCharPro";
import {
  add5eCharBackQuery,
  get5eCharBackByGeneralQuery,
  remove5eCharBackQuery,
  get5eCharBackQuery,
  edit5eCharBackQuery,
} from "../queries/5eCharBack";
import {
  get5eCharSpellSlotInfosByGeneralQuery,
  add5eCharSpellSlotInfoQuery,
  remove5eCharSpellSlotInfoQuery,
} from "../queries/5eCharSpellSlots";
import {
  get5eCharAttacksByGeneralQuery,
  remove5eCharAttackQuery,
} from "../queries/5eCharAttacks";
import {
  remove5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
} from "../queries/5eCharEquipment";
import {
  get5eCharFeatsByGeneralQuery,
  remove5eCharFeatQuery,
} from "../queries/5eCharFeats";
import {
  get5eCharSpellsByGeneralQuery,
  remove5eCharSpellQuery,
} from "../queries/5eCharSpells";
import {
  get5eCharOtherProLangsByGeneralQuery,
  remove5eCharOtherProLangQuery,
} from "../queries/5eCharOtherProLang";
import {
  getProjectPlayersByPlayerQuery,
  removeProjectPlayerQuery,
} from "../queries/projectPlayers";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { Request, Response, NextFunction } from "express";

async function add5eChar(req: Request, res: Response, next: NextFunction) {
  try {
    // check if user is pro
    const generalsData = await get5eCharsGeneralByUserQuery(req.user.id);
    // limit to three projects
    if (generalsData.rows.length >= 5) {
      if (!req.user.is_pro)
        throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
    }

    req.body.user_id = req.user.id;
    const generalData = await add5eCharGeneralQuery(req.body);
    const general = generalData.rows[0];
    await add5eCharProQuery({ general_id: general.id });
    await add5eCharBackQuery({ general_id: general.id });
    await add5eCharSpellSlotInfoQuery({ general_id: general.id });

    res.status(201).json(general);
  } catch (err) {
    next(err);
  }
}

async function get5eCharsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const generalsData = await get5eCharsGeneralByUserQuery(req.user.id);
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

        general.proficiencies = pro;
        general.background = back;
        general.spell_slots = spellSlots;
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

    general.proficiencies = pro;
    general.background = back;
    general.spell_slots = spellSlots;

    res.send(general);
  } catch (err) {
    next(err);
  }
}

async function remove5eChar(req: Request, res: Response, next: NextFunction) {
  try {
    const generalData = await get5eCharGeneralQuery(req.params.id);
    const general = generalData.rows[0];

    const proData = await get5eCharProByGeneralQuery(general.id);
    const pro = proData.rows[0];
    const backData = await get5eCharBackByGeneralQuery(general.id);
    const back = backData.rows[0];
    const spellSlotsData = await get5eCharSpellSlotInfosByGeneralQuery(
      general.id
    );
    const spellSlots = spellSlotsData.rows[0];

    await remove5eCharGeneralQuery(general.id);
    await remove5eCharProQuery(pro.id);
    await remove5eCharBackQuery(back.id);
    await remove5eCharSpellSlotInfoQuery(spellSlots.id);

    const attacksData = await get5eCharAttacksByGeneralQuery(general.id);
    attacksData.rows.forEach(async (attack) => {
      await remove5eCharAttackQuery(attack.id);
    });
    const equipmentData = await get5eCharEquipmentsByGeneralQuery(general.id);
    equipmentData.rows.forEach(async (equipment) => {
      await remove5eCharEquipmentQuery(equipment.id);
    });
    const featsData = await get5eCharFeatsByGeneralQuery(general.id);
    featsData.rows.forEach(async (feat) => {
      await remove5eCharFeatQuery(feat.id);
    });
    const spellsData = await get5eCharSpellsByGeneralQuery(general.id);
    spellsData.rows.forEach(async (spell) => {
      await remove5eCharSpellQuery(spell.id);
    });
    const otherProLangsData = await get5eCharOtherProLangsByGeneralQuery(
      general.id
    );
    otherProLangsData.rows.forEach(async (other) => {
      await remove5eCharOtherProLangQuery(other.id);
    });
    const projectPlayerData = await getProjectPlayersByPlayerQuery(general.id);
    projectPlayerData.rows.forEach(async (projectPlayer) => {
      await removeProjectPlayerQuery(projectPlayer.id);
    });

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
    const data = await edit5eCharGeneralQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function edit5eCharPro(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await edit5eCharProQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function edit5eCharBack(req: Request, res: Response, next: NextFunction) {
  try {
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
};
