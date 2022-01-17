// MongoDB schema for Directors
const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema({
    name: String,
    age: String,
})

module.exports = mongoose.model('Director', directorSchema);