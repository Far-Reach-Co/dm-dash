const {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  removeProjectQuery,
  editProjectQuery,
} = require("../queries/projects.js");
const {
  getProjectInviteByProjectQuery,
  removeProjectInviteQuery,
} = require("../queries/projectInvites.js");
const {
  getProjectUsersQuery,
  getProjectUserByUserAndProjectQuery,
  getProjectUsersByProjectQuery,
  removeProjectUserQuery,
} = require("../queries/projectUsers.js");
const {
  getCalendarQuery,
  removeCalendarQuery,
} = require("../queries/calendars.js");
const { getMonthsQuery, removeMonthQuery } = require("../queries/months.js");
const { getDaysQuery, removeDayQuery } = require("../queries/days.js");
const {
  getLocationsQuery,
  removeLocationQuery,
} = require("../queries/locations.js");
const {
  getCharactersQuery,
  removeCharacterQuery,
} = require("../queries/characters.js");
const { getClocksQuery, removeClockQuery } = require("../queries/clocks.js");
const {
  removeCounterQuery,
  getAllCountersByProjectQuery,
} = require("../queries/counters.js");
const { getEventsQuery, removeEventQuery } = require("../queries/events.js");
const { getItemsQuery, removeItemQuery } = require("../queries/items.js");
const { getLoresQuery, removeLoreQuery } = require("../queries/lores.js");
const {
  removeLoreRelationQuery,
  getLoreRelationsQuery,
} = require("../queries/loreRelations.js");
const {
  getAllNotesByProjectQuery,
  removeNoteQuery,
} = require("../queries/notes.js");
const { getImageQuery, removeImageQuery } = require("../queries/images.js");
const { removeFile } = require("./s3.js");
const {
  addTableViewQuery,
  getTableViewsQuery,
  removeTableViewQuery,
} = require("../queries/tableViews.js");
const {
  getTableImagesQuery,
  removeTableImageQuery,
} = require("../queries/tableImages.js");
const { USER_IS_NOT_PRO } = require("../../lib/enums.js");

async function addProject(req, res, next) {
  try {
    // check if user is pro
    const projectsData = await getProjectsQuery(req.user.id);
    // limit to three projects
    if (projectsData.rows.length >= 3) {
      if (!req.user.is_pro) throw { status: 402, message: USER_IS_NOT_PRO };
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

async function getProject(req, res, next) {
  try {
    const projectData = await getProjectQuery(req.params.id);
    const project = projectData.rows[0];
    const projectUsersData = await getProjectUserByUserAndProjectQuery(
      req.user.id,
      project.id
    );
    if (projectUsersData.rows.length) {
      const projectUser = projectUsersData.rows[0];
      project.was_joined = true;
      project.project_user_id = projectUser.id;
      project.date_joined = projectUser.date_joined;
      project.is_editor = projectUser.is_editor;
    }
    res.send(project);
  } catch (err) {
    next(err);
  }
}

async function getProjects(req, res, next) {
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
          project.was_joined = true;
          project.project_user_id = projectUser.id;
          project.date_joined = projectUser.date_joined;
          project.is_editor = projectUser.is_editor;
          projectsData.rows.push(project);
        }
      }
    }
    // get project invites
    for (var project of projectsData.rows) {
      const projectInvites = await getProjectInviteByProjectQuery(project.id);
      if (projectInvites && projectInvites.rows && projectInvites.rows.length)
        project.project_invite = projectInvites.rows[0];
    }

    res.send(projectsData.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProject(req, res, next) {
  try {
    // remove project
    await removeProjectQuery(req.params.id);
    // remove all project data
    // calendars
    const calendarData = await getCalendarQuery(req.params.id);
    calendarData.rows.forEach(async (calendar) => {
      await removeCalendarQuery(calendar.id);
      // remove months and days associated
      const monthsData = await getMonthsQuery(calendar.id);
      monthsData.rows.forEach(async (month) => {
        await removeMonthQuery(month.id);
      });
      const daysData = await getDaysQuery(calendar.id);
      daysData.rows.forEach(async (day) => {
        await removeDayQuery(day.id);
      });
    });
    // locations
    const locationsData = await getLocationsQuery({
      projectId: req.params.id,
      limit: 10000,
      offset: 0,
    });
    locationsData.rows.forEach(async (location) => {
      await removeLocationQuery(location.id);
      if (location.image_id) {
        const imageData = await getImageQuery(location.image_id);
        const image = imageData.rows[0];
        await removeFile("wyrld/images", image);
        await removeImageQuery(image.id);
      }
    });
    // characters
    const charactersData = await getCharactersQuery({
      projectId: req.params.id,
      limit: 10000,
      offset: 0,
    });
    charactersData.rows.forEach(async (character) => {
      await removeCharacterQuery(character.id);
      if (character.image_id) {
        const imageData = await getImageQuery(character.image_id);
        const image = imageData.rows[0];
        await removeFile("wyrld/images", image);
        await removeImageQuery(image.id);
      }
    });
    // clocks
    const clocksData = await getClocksQuery(req.params.id);
    clocksData.rows.forEach(async (clock) => {
      await removeClockQuery(clock.id);
    });
    // counters
    const countersData = await getAllCountersByProjectQuery(req.params.id);
    countersData.rows.forEach(async (counter) => {
      await removeCounterQuery(counter.id);
    });
    // events
    const eventsData = await getEventsQuery({
      projectId: req.params.id,
      limit: 1000000,
      offset: 0,
    });
    eventsData.rows.forEach(async (event) => {
      await removeEventQuery(event.id);
    });
    // items
    const itemsData = await getItemsQuery({
      projectId: req.params.id,
      limit: 10000,
      offset: 0,
    });
    itemsData.rows.forEach(async (item) => {
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
    loreData.rows.forEach(async (lore) => {
      await removeLoreQuery(lore.id);
      if (lore.image_id) {
        const imageData = await getImageQuery(lore.image_id);
        const image = imageData.rows[0];
        await removeFile("wyrld/images", image);
        await removeImageQuery(image.id);
      }
      const relationsData = await getLoreRelationsQuery(lore.id);
      relationsData.rows.forEach(async (relation) => {
        await removeLoreRelationQuery(relation.id);
      });
    });
    // notes
    const notesData = await getAllNotesByProjectQuery(req.params.id);
    notesData.rows.forEach(async (note) => {
      await removeNoteQuery(note.id);
    });
    // project invites
    const projectInvitesData = await getProjectInviteByProjectQuery(
      req.params.id
    );
    projectInvitesData.rows.forEach(async (invite) => {
      await removeProjectInviteQuery(invite.id);
    });
    // project users
    const projectUsersData = await getProjectUsersByProjectQuery(req.params.id);
    projectUsersData.rows.forEach(async (user) => {
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

async function editProject(req, res, next) {
  try {
    const data = await editProjectQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  getProject,
  addProject,
  removeProject,
  editProject,
};
