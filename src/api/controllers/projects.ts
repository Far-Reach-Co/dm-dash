import {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  removeProjectQuery,
  editProjectQuery,
  ProjectModel,
} from "../queries/projects.js";
import {
  ProjectInviteModel,
  getProjectInviteByProjectQuery,
  removeProjectInviteQuery,
} from "../queries/projectInvites.js";
import {
  getProjectUsersQuery,
  getProjectUserByUserAndProjectQuery,
  getProjectUsersByProjectQuery,
  removeProjectUserQuery,
} from "../queries/projectUsers.js";
import { getCalendarQuery, removeCalendarQuery } from "../queries/calendars.js";
import { getMonthsQuery, removeMonthQuery } from "../queries/months.js";
import { getDaysQuery, removeDayQuery } from "../queries/days.js";
import {
  getLocationsQuery,
  removeLocationQuery,
} from "../queries/locations.js";
import {
  getCharactersQuery,
  removeCharacterQuery,
} from "../queries/characters.js";
import { getClocksQuery, removeClockQuery } from "../queries/clocks.js";
import {
  removeCounterQuery,
  getAllCountersByProjectQuery,
} from "../queries/counters.js";
import { getEventsQuery, removeEventQuery } from "../queries/events.js";
import { getItemsQuery, removeItemQuery } from "../queries/items.js";
import { getLoresQuery, removeLoreQuery } from "../queries/lores.js";
import {
  removeLoreRelationQuery,
  getLoreRelationsQuery,
} from "../queries/loreRelations.js";
import {
  getAllNotesByProjectQuery,
  removeNoteQuery,
} from "../queries/notes.js";
import { getImageQuery, removeImageQuery } from "../queries/images.js";
import { removeFile } from "./s3.js";
import {
  addTableViewQuery,
  getTableViewsQuery,
  removeTableViewQuery,
} from "../queries/tableViews.js";
import {
  getTableImagesQuery,
  removeTableImageQuery,
} from "../queries/tableImages.js";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { Request, Response, NextFunction } from "express";

async function addProject(req: Request, res: Response, next: NextFunction) {
  try {
    // check if user is pro
    const projectsData = await getProjectsQuery(req.user.id);
    // limit to three projects
    if (projectsData.rows.length >= 3) {
      if (!req.user.is_pro)
        throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
    }

    req.body.user_id = req.user.id;
    const data = await addProjectQuery(req.body);
    // add first project table view
    await addTableViewQuery({ project_id: data.rows[0].id });
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

interface GetProjectDataReturnModel extends ProjectModel {
  was_joined: boolean;
  project_user_id: number;
  date_joined: string;
  is_editor: boolean;
  project_invite: ProjectInviteModel;
}

async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const projectData = await getProjectQuery(req.params.id);
    const project = projectData.rows[0];
    const projectUsersData = await getProjectUserByUserAndProjectQuery(
      req.user.id,
      project.id
    );
    if (projectUsersData.rows.length) {
      const projectUser = projectUsersData.rows[0];
      (project as GetProjectDataReturnModel).was_joined = true;
      (project as GetProjectDataReturnModel).project_user_id = projectUser.id;
      (project as GetProjectDataReturnModel).date_joined =
        projectUser.date_joined;
      (project as GetProjectDataReturnModel).is_editor = projectUser.is_editor;
    }
    res.send(project);
  } catch (err) {
    next(err);
  }
}

async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projectsData = await getProjectsQuery(req.user.id);
    // get joined projects
    const projectUserData = await getProjectUsersQuery(req.user.id);
    if (
      projectUserData &&
      projectUserData.rows &&
      projectUserData.rows.length
    ) {
      for (var projectUser of projectUserData.rows) {
        const projectData = await getProjectQuery(projectUser.project_id);
        if (projectData && projectData.rows && projectData.rows.length) {
          const project = projectData.rows[0];
          (project as GetProjectDataReturnModel).was_joined = true;
          (project as GetProjectDataReturnModel).project_user_id =
            projectUser.id;
          (project as GetProjectDataReturnModel).date_joined =
            projectUser.date_joined;
          (project as GetProjectDataReturnModel).is_editor =
            projectUser.is_editor;
          projectsData.rows.push(project);
        }
      }
    }
    // get project invites
    for (var project of projectsData.rows) {
      const projectInvites = await getProjectInviteByProjectQuery(project.id);
      if (projectInvites && projectInvites.rows && projectInvites.rows.length)
        (project as GetProjectDataReturnModel).project_invite =
          projectInvites.rows[0];
    }

    res.send(projectsData.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProject(req: Request, res: Response, next: NextFunction) {
  try {
    // remove project
    await removeProjectQuery(req.params.id);
    // remove all project data
    // calendars
    const calendarData = await getCalendarQuery(req.params.id);
    calendarData.rows.forEach(async (calendar: { id: any }) => {
      await removeCalendarQuery(calendar.id);
      // remove months and days associated
      const monthsData = await getMonthsQuery(calendar.id);
      monthsData.rows.forEach(async (month: { id: any }) => {
        await removeMonthQuery(month.id);
      });
      const daysData = await getDaysQuery(calendar.id);
      daysData.rows.forEach(async (day: { id: any }) => {
        await removeDayQuery(day.id);
      });
    });
    // locations
    const locationsData = await getLocationsQuery({
      projectId: req.params.id,
      limit: 10000,
      offset: 0,
    });
    locationsData.rows.forEach(
      async (location: { id: any; image_id: string }) => {
        await removeLocationQuery(location.id);
        if (location.image_id) {
          const imageData = await getImageQuery(location.image_id);
          const image = imageData.rows[0];
          await removeFile("wyrld/images", image);
          await removeImageQuery(image.id);
        }
      }
    );
    // characters
    const charactersData = await getCharactersQuery({
      projectId: req.params.id,
      limit: 10000,
      offset: 0,
    });
    charactersData.rows.forEach(
      async (character: { id: any; image_id: string }) => {
        await removeCharacterQuery(character.id);
        if (character.image_id) {
          const imageData = await getImageQuery(character.image_id);
          const image = imageData.rows[0];
          await removeFile("wyrld/images", image);
          await removeImageQuery(image.id);
        }
      }
    );
    // clocks
    const clocksData = await getClocksQuery(req.params.id);
    clocksData.rows.forEach(async (clock: { id: any }) => {
      await removeClockQuery(clock.id);
    });
    // counters
    const countersData = await getAllCountersByProjectQuery(req.params.id);
    countersData.rows.forEach(async (counter: { id: any }) => {
      await removeCounterQuery(counter.id);
    });
    // events
    const eventsData = await getEventsQuery({
      projectId: req.params.id,
      limit: 1000000,
      offset: 0,
    });
    eventsData.rows.forEach(async (event: { id: any }) => {
      await removeEventQuery(event.id);
    });
    // items
    const itemsData = await getItemsQuery({
      projectId: req.params.id,
      limit: 10000,
      offset: 0,
    });
    itemsData.rows.forEach(async (item: { id: any; image_id: string }) => {
      await removeItemQuery(item.id);
      if (item.image_id) {
        const imageData = await getImageQuery(item.image_id);
        const image = imageData.rows[0];
        await removeFile("wyrld/images", image);
        await removeImageQuery(image.id);
      }
    });
    // lore
    const loreData = await getLoresQuery({
      projectId: req.params.id,
      limit: 10000,
      offset: 0,
    });
    loreData.rows.forEach(async (lore: { id: any; image_id: string }) => {
      await removeLoreQuery(lore.id);
      if (lore.image_id) {
        const imageData = await getImageQuery(lore.image_id);
        const image = imageData.rows[0];
        await removeFile("wyrld/images", image);
        await removeImageQuery(image.id);
      }
      const relationsData = await getLoreRelationsQuery(lore.id);
      relationsData.rows.forEach(async (relation: { id: any }) => {
        await removeLoreRelationQuery(relation.id);
      });
    });
    // notes
    const notesData = await getAllNotesByProjectQuery(req.params.id);
    notesData.rows.forEach(async (note: { id: any }) => {
      await removeNoteQuery(note.id);
    });
    // project invites
    const projectInvitesData = await getProjectInviteByProjectQuery(
      req.params.id
    );
    projectInvitesData.rows.forEach(async (invite: { id: any }) => {
      await removeProjectInviteQuery(invite.id);
    });
    // project users
    const projectUsersData = await getProjectUsersByProjectQuery(req.params.id);
    projectUsersData.rows.forEach(async (user: { id: any }) => {
      await removeProjectUserQuery(user.id);
    });
    // table images
    const tableImages = await getTableImagesQuery(req.params.id);
    tableImages.rows.forEach(async (tableImage) => {
      const imageData = await getImageQuery(tableImage.image_id);
      const image = imageData.rows[0];
      await removeFile("wyrld/images", image);
      await removeTableImageQuery(tableImage.id);
    });
    // table views
    const tableViews = await getTableViewsQuery(req.params.id);
    tableViews.rows.forEach(async (tableView) => {
      await removeTableViewQuery(tableView.id);
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProject(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editProjectQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getProjects, getProject, addProject, removeProject, editProject };
