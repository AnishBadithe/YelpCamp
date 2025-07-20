const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const numGenerator = (array) => Math.floor(Math.random() * array.length);

const seedsDB = async () => {
    await Campground.deleteMany({});
    
    for(let i = 0; i < 50; i++)
    {
        const num = numGenerator(cities);
        const p = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({

            author: '686e3619cca3e67e2c551697',
            location: `${cities[num].city}, ${cities[num].state}`,
            title: `${descriptors[numGenerator(descriptors)]} ${places[numGenerator(places)]}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate voluptatem natus possimus sequi vero. Error laudantium dolorem praesentium, cumque, odit doloribus architecto nihil distinctio aut debitis dicta in tempora cum!',
            price: p,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[num].longitude, 
                    cities[num].latitude
                ]
            },
            images: [
            {
                url: 'https://res.cloudinary.com/dvt4pbhdh/image/upload/v1752472077/YelpCamp/ql7uqljugpodyvckcf2k.avif',
                filename: 'YelpCamp/qvzvd7ffmfkq34p7yx55',
            }
        ],

        });

        await camp.save();
    }
};

seedsDB().then(() => {
    mongoose.connection.close();
});