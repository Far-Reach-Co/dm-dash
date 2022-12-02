const {addProjectQuery, getProjectsQuery, removeProjectQuery, editProjectQuery} = require('../queries/Projects.js')

async function addProject(req, res, next) {
  try {
    const data = await addProjectQuery(req.body)
    res.status(201).json(data.rows[0])
  } catch(err) {
    next(err)
  }
}

async function getProjects(req, res, next) {
  try {
    const data = await getProjectsQuery()

    res.send(data.rows)
  } catch(err) {
    next(err)
  }
}

async function removeProject(req, res, next) {
  try {
    const data = await removeProjectQuery(req.params.id)
    res.status(204).send()
  } catch(err) {
    next(err)
  }
}

async function editProject(req, res, next) {
  try {
    const data = await editProjectQuery(req.params.id, req.body)
    res.status(200).send(data)
  } catch(err) {
    next(err)
  }
}

module.exports = {
  getProjects,
  addProject,
  removeProject,
  editProject
}