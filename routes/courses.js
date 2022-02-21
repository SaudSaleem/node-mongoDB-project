const express = require('express')
const router = express.Router() 
let courses = [{id:1,name:'computer'},{id:2,name:'Bio'}]

router.get('/',(req, res) => {
    res.send(courses)
})

router.get('/:id',(req, res) => {
    let course = courses.find(course => course.id == req.params.id)
    if(course) res.status(200).json(course)
    else  res.status(404).json('course not found')
   
})


router.post('/',(req, res) => {
    let course = {
        id: courses.length + 1,
        name: req.body.name
    }
    courses.push(course)
    res.send(courses)
})
module.exports =  router 