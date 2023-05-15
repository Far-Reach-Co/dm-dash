const {
  getTableViewsQuery,
  getTableViewQuery,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewQuery,
} = require("../queries/tableViews.js");

const { USER_IS_NOT_PRO } = require("../../lib/enums.js");

async function addTableView(req, res, next) {
  try {
    // check if user is pro
    const tableViewsData = await getTableViewsQuery(req.body.project_id);
    // limit to two campaigns
    if (tableViewsData.rows.length >= 2) {
      if (!req.user.is_pro) throw { status: 402, message: USER_IS_NOT_PRO };
    }

    const data = await addTableViewQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getTableViews(req, res, next) {
  try {
    const data = await getTableViewsQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getTableView(req, res, next) {
  try {
    const tableViewData = await getTableViewQuery(req.params.id);
    const tableView = tableViewData.rows[0];

    res.send(tableView);
  } catch (err) {
    next(err);
  }
}

async function removeTableView(req, res, next) {
  try {
    await removeTableViewQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableView(req, res, next) {
  try {
    const data = await editTableViewQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addTableView,
  getTableViews,
  getTableView,
  removeTableView,
  editTableView,
};
