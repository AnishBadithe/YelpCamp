const express = require('express');
const router = express.Router({ mergeParams: true });

const campground = require('../controllers/campgrounds');

const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

router.route('/')
    //displaying all the camps
    .get(catchAsync(campground.index))
    //creating new camp post request
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createCampground));

//creating new camp get request
router.get('/new', isLoggedIn, campground.renderNewForm);

router.route('/:id')
    //displaying details of a camp
    .get(catchAsync(campground.showCampgrounds))
    //updating a camp
    .put(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.updateCampground))
    //deleting a camp
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground));


//editing a camp
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditForm));

module.exports = router;