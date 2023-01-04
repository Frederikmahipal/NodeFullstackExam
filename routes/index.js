const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('frontpage.ejs')
})

module.exports = router;