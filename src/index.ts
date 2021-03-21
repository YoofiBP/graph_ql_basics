import {GraphQLServer, PubSub} from 'graphql-yoga';
import db from './database';
import query from "./resolvers/Query";
import mutation from "./resolvers/Mutation";
import user from "./resolvers/User";
import comment from "./resolvers/Comment";
import post from "./resolvers/Post";
import Subscription from "./resolvers/Subscription";

//Subscriptions
const pubSub = new PubSub()

//Resolvers
const resolvers = {
    Query: query,
    Mutation: mutation,
    Post: post,
    User: user,
    Comment: comment,
    Subscription
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql', resolvers, context: {
        db,
        pubSub
    }
})

server.start(() => {
    console.log('Server is up and running')
})
