const express = require('express')
const router = express.Router() 
const courses = require('./courses')

router.use('/api/courses',courses)

module.exports =  router 