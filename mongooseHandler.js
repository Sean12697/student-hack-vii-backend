const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
let Schema = mongoose.Schema;

const Details = new Schema({
    first_name: String,
    surname: String,
    email: String,
    personal_statement: String,
    social_media: Object
});

const Portfolios = new Schema({
    name: String,
    date: Date,
    url: String
});

const Item = new Schema({
    title: String,
    start_date: Date,
    end_date: Date,
    location: String,
    for: String,
    description: String,
    category: String,
    generic_skills: [String],
    specific_skills: [String],
    soft_skills: [String],
    importance: Number,
    manditory: Boolean
});

const User = new Schema({
    email: String,
    password: String,
    session_key: [String],
    details: Details,
    portfolios: [Portfolios],
    items: [Item]
});

const UserModel = mongoose.model("User", User, "users");
class mongooseHandler {
    constructor() {
        console.log("Connection")
        mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_ATLAS_PW || require("./nodemon.json").env.MONGO_ATLAS_PW}@cv-generator-vxyqt.mongodb.net/test?retryWrites=true`, {
            useNewUrlParser: true
        }, err => {
            if (err) console.log(err)
        });
    }

    async signup(email, password) {
        console.log(`Signup: ${email}`);
        return new Promise(resolve => {
            UserModel.find({
                email: email,
            }, (err, users) => {
                console.log(`Signup Users: ${users}`);
                console.log(`Signup Users: ${users.length}`);
                console.log(`Signup Users: ${users.map(u => u.email).toString()}`);
                // if a user has that email address, don't insert
                if (users.length == 0) {
                    this._signup(email, password).then(key => resolve(key));
                } else {
                    resolve("");
                }
            });
        });
    }

    async signin(email, password) {
        console.log(`Signin: ${email}`);
        return new Promise(resolve => {
            UserModel.find({
                email: email
            }, (err, users) => {
                console.log(`Signin Users: ${users.map(u => u.email).toString()}`);
                // Removing user/s where the password does not match up
                users = users.filter(user => bcrypt.compareSync(password, user.password));
                // if user exists, insert and return session key
                if (users.length === 1) {
                    this._signin(users[0]).then(key => resolve(key));
                } else {
                    resolve("");
                }
            });
        });
    }

    addItem(item, email, session_key) {
        UserModel.find({
            email: email,
            session_key: {
                "$regex": session_key,
                "$options": "i"
            }
        }, (err, users) => {
            let newItems = users[0].items.filter(i => i._id !== item._id);
            newItems.push(item);
            let newUser = users[0];
            newUser.items = newItems;
            UserModel.findOneAndUpdate({
                email: newUser.email,
                session_key: {
                    "$regex": session_key,
                    "$options": "i"
                }
            }, newUser, {
                upsert: true,
                useFindAndModify: false
            }, (err, doc) => {
                console.log(`ERROR: '${users[0].email}' Add Item - ${err}`)
            });
        });
    }

    updateUser(newUser, email, session_key) {
        UserModel.find({
            email: email,
            session_key: {
                "$regex": session_key,
                "$options": "i"
            }
        }, (err, users) => {
            UserModel.findOneAndUpdate({
                email: email,
                session_key: {
                    "$regex": session_key,
                    "$options": "i"
                }
            }, newUser, {
                upsert: true,
                useFindAndModify: false
            }, (err, doc) => {
                if (err) console.log(`ERROR: '${users[0].email}' Update - ${err}`);
            });
        });
    }

    async getUser(email, session_key) {
        return new Promise(resolve => {
            UserModel.find({
                email: email,
                session_key: {
                    "$regex": session_key,
                    "$options": "i"
                }
            }, (err, users) => {
                resolve(users[0]);
            });
        });
    }

    async getCategories(email, session_key) {
        return new Promise(resolve => {
            UserModel.find({
                email: email,
                session_key: {
                    "$regex": session_key,
                    "$options": "i"
                }
            }, (err, users) => { // ensuring a user has items on their profile
                let categories = (users[0].items > 0) ? [""] : users[0].items.map(i => i.category).filter((v, i, s) => s.indexOf(v) === i);
                resolve(categories);
            });
        });
    }

    async getItems(email, session_key) {
        return new Promise(resolve => {
            UserModel.find({
                email: email,
                session_key: {
                    "$regex": session_key,
                    "$options": "i"
                }
            }, (err, users) => {
                resolve(users[0].items);
            });
        });
    }

    async getPortfolios(email, session_key) {
        return new Promise(resolve => {
            UserModel.find({
                email: email,
                session_key: {
                    "$regex": session_key,
                    "$options": "i"
                }
            }, (err, users) => {
                resolve(users[0].portfolios);
            });
        });
    }

    async _signin(user) {
        return new Promise(resolve => {
            let session_key = this.generateUniqueSessionKey();
            user.session_key.push(session_key);
            UserModel.findOneAndUpdate({
                email: user.email,
                password: user.password
            }, user, {
                upsert: true,
                useFindAndModify: false
            }, (err, doc) => {
                console.log(`ERROR: '${user.email}' Signin - ${err}`);
                resolve(session_key);
            });
        });
    }

    async _signup(email, password) {
        return new Promise(resolve => {
            let session_key = this.generateUniqueSessionKey(),
                encrypted = bcrypt.hashSync(password, 7);
            (new UserModel({
                email: email,
                password: encrypted,
                session_key: [session_key],
                details: {},
                portfolios: [],
                items: []
            })).save((err, doc, row) => {
                resolve(session_key);
            });
        });
    }

    generateUniqueSessionKey() {
        return (new Array(9).fill("")).map(i => Math.random().toString(36).substring(7)).reduce((pre, curr) => pre += curr, "");
    }

    close() {
        mongoose.connection.close();
    }
}

module.exports = mongooseHandler;