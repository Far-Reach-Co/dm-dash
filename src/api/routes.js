const express = require('express')
const {getClocks, addClock, removeClock, editClock} = require('./controllers/clocks.js')
const { getProjects, addProject, removeProject, editProject } = require('./controllers/projects.js')
const {
  getUserByToken,
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  verifyJwt,
  editUser,
  // resetPassword,
  // requestResetEmail
} = require('./controllers/users.js')

var router = express.Router()

// clocks
router.get('/get_clocks/:project_id', getClocks)
router.post('/add_clock', addClock)
router.delete('/remove_clock/:id', removeClock)
router.post('/edit_clock/:id', editClock)

// projects
router.get('/get_projects/:id', getProjects)
router.post('/add_project', addProject)
router.delete('/remove_project/:id', removeProject)
router.post('/edit_project/:id', editProject)

// users
router.get('/users', getAllUsers)
router.get('/get_user', getUserByToken)
router.get('/get_user_by_id/:id', getUserById)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/verify_jwt', verifyJwt)
router.post('/edit_user', editUser)
// router.post('/reset_password', resetPassword)
// router.post('/request_reset_email', requestResetEmail)

module.exports = router