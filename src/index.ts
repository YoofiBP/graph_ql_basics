import { GraphQLServer } from 'graphql-yoga';
import db from './database';
import query from "./resolvers/Query";
import mutation from "./resolvers/Mutation";
import user from "./resolvers/User";
import comment from "./resolvers/Comment";
import post from "./resolvers/Post";

//Resolvers
const resolvers = {
    Query: query,
    Mutation: mutation,
    Post: post,
    User: user,
    Comment: comment
}

const server = new GraphQLServer({typeDefs: './src/schema.graphql', resolvers, context: {
    db
    }})

server.start(() => {
    console.log('Server is up and running')
})
