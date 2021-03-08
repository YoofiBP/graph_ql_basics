import { GraphQLServer } from 'graphql-yoga';

//Type Definitions - Application Schema
const typeDefs = `
    type Query {
        title: String!
        price: Float!
        releaseYear: Int,
        rating: Float,
        inStock: Boolean!
        me: User!
        post: Post!
    }
    
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
    }
    
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
    }
`

//Resolvers
const resolvers = {
    Query: {
        title(){
            return "Die Hard"
        },
        price(){
            return 12.5;
        },
        releaseYear(){
            return 1996;
        },
        rating(){
            return 4.5;
        },
        inStock(){
            return true;
        },
        me(){
            return {
                id: 1,
                name: "Naa Ayorkor",
                email: "naa@gmail.com",

            }
        },
        post(){
            return {
                id: 1,
                title: "Whisper in the Wind",
                body: "A great post",
                published: true
            }
        }
    },


}

const server = new GraphQLServer({typeDefs, resolvers})

server.start(() => {
    console.log('Server is up and running')
})
