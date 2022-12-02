const {addProjectModuleQuery, getProjectModulesQuery, removeProjectModuleQuery, editProjectModuleQuery} = require('../queries/ProjectModules.js')

async function addProjectModule(req, res, next) {
  try {
    const data = await addProjectModuleQuery(req.body)
    res.status(201).json(data.rows[0])
  } catch(err) {
    next(err)
  }
}

async function getProjectModules(req, res, next) {
  try {
    const data = await getProjectModulesQuery()

    res.send(data.rows)
  } catch(err) {
    next(err)
  }
}

async function removeProjectModule(req, res, next) {
  try {
    const data = await removeProjectModuleQuery(req.params.id)
    res.status(204).send()
  } catch(err) {
    next(err)
  }
}

async function editProjectModule(req, res, next) {
  try {
    const data = await editProjectModuleQuery(req.params.id, req.body)
    res.status(200).send(data)
  } catch(err) {
    next(err)
  }
}

module.exports = {
  getProjectModules,
  addProjectModule,
  removeProjectModule,
  editProjectModule
}