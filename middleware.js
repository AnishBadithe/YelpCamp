const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campgrounds');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {

    if(!req.isAuthenticated())
    {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }

    next();
}

module.exports.storeReturnTo = (req, res, next) => {

    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }

    next();
}

module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);

    if(error)
    {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    }

    else
    next();
}

module.exports.isAuthor = async (req, res, next) => {

    const camp = await Campground.findById(req.params.id);

    if(!camp.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${req.params.id}`);
    }

    next();
}

module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body.validate);

    if(error)
    {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    }

    else
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {

    const review = await Review.findById(req.params.reviewId);

    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${req.params.id}`);
    }

    next();
}