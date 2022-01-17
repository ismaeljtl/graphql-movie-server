// The schema describes the data on the graph, the relationship between the types and the queryies that can be made
const graphql = require('graphql');
const Movie = require('../models/movie');
const Director = require('../models/director');

const { 
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString, 
    GraphQLSchema, 
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql;

// DATA TYPES
// the fileds property is wrapped in () in order to be a function
// that way, when this is initialized all the types make a hoisting
// and that way the relationship between all the types don't give errors
// (if we didn't had the hoisting the relationship between multiple types would give an error of TYPE NOT DEFINED)
const MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        director: {
            type: DirectorType,
            resolve: (parent, args) => {
                return Director.findById(parent.directorId);
            }
        }
    }),
})

const DirectorType = new GraphQLObjectType({
    name: 'Director',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        movies: {
            type: new GraphQLList(MovieType),
            resolve: (parent, args) => {
                return Movie.find({directorId: parent.id});
            }
        }
    }),
})

// QUERIES
// the rootQuery is the object that will have all the queries that can be made to our graphql server
// the resolve function inside every filed object (query) is the function in charge of resolving that query 
const rootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        movie: {
            type: MovieType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Movie.findById(args.id);
            }
        },
        movieCollection: {
            type: new GraphQLList(MovieType),
            resolve: (parent, args) => {
                // if we pass no arguments to find it returns all items (this is mongoose)
                return Movie.find({});
            }
        },
        director: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Director.findById(args.id);
            }
        },
        directorCollection: {
            type: new GraphQLList(DirectorType),
            resolve: (parent, args) => {
                return Director.find({});
            }
        },
    })
})

// Mutations: operations to change the data
const mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: () => ({
        addDirector: {
            type: DirectorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, args) {
                let director = new Director({
                    name: args.name,
                    age: args.age
                })
                return director.save()
            }
        },
        editDirector: {
            type: DirectorType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) }
            },
            // we can use async await in reoslve functions!
            async resolve(parent, args) {
                const data = await Director.findByIdAndUpdate(args.id, {
                    name: args.name,
                    age: args.age
                })
                return data;
            }
        },
        deleteDirector: {
            type: DirectorType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Director.deleteOne({_id: args.id});
            }
        },
        addMovie: {
            type: MovieType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString)},
                directorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                let movie = new Movie({
                    name: args.name,
                    genre: args.genre,
                    directorId: args.directorId
                })
                return movie.save();
            }
        },
        editMovie: {
            type: MovieType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLInt) },
                directorId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                return Movie.findByIdAndUpdate(args.id, {
                    name: args.name,
                    genre: args.genre,
                    directorId: args.directorId
                })
            }
        },
        deleteMovie: {
            type: MovieType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Movie.deleteOne({_id: args.id});
            }
        },
    })
})

// we need to export the rootQuery in order to be able to make queries to our graphql server
module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation: mutations
})