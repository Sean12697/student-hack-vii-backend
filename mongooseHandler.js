const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const Details = new Schema({
    first_name: String,
    surname: String,
    email: String,
    personal_statement: String,
    socal_media: Object
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
        mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_ATLAS_PW}@cv-generator-vxyqt.mongodb.net/test?retryWrites=true`, {
            useNewUrlParser: true
        }, err => console.log(err));
    }

    async signup(email, password) {
        return new Promise(resolve => {
            UserModel.find({
                email: email,
            }, (err, users) => {
                // if a user has that email address, don't insert
                let key = (users.length > 0) ? "" : this._signup(email, password);
                resolve(key);
            });
        });
    }

    async signin(email, password) {
        return new Promise(resolve => {
            UserModel.find({
                email: email,
                password: password
            }, (err, users) => {
                // if user exists, insert and return session key
                let key = (users.length === 1) ? this._signin(users[0]) : "";
                resolve(key);
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
                upsert: true
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
                email: users[0].email,
                session_key: {
                    "$regex": session_key,
                    "$options": "i"
                }
            }, newUser, {
                upsert: true
            }, (err, doc) => {
                console.log(`ERROR: '${users[0].email}' Update - ${err}`)
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

    _signin(user) {
        let session_key = this.generateUniqueSessionKey();
        user.session_key.push(session_key);
        UserModel.findOneAndUpdate({
            email: user.email,
            password: user.password
        }, user, {
            upsert: true
        }, (err, doc) => {
            console.log(`ERROR: '${user.email}' Signin - ${err}`)
        });
        return session_key;
    }

    _signup(email, password) {
        let session_key = this.generateUniqueSessionKey();
        (new User({
            email: email,
            password: password,
            session_key: [session_key],
            details: {},
            portfolios: [],
            items: []
        })).save();
        return session_key;
    }

    generateUniqueSessionKey() {
        return Math.random().toString(36).substring(64);
    }

    close() {
        mongoose.connection.close();
    }
}

export {mongoose,mongooseHandler};