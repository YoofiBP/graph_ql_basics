import { GraphQLServer } from 'graphql-yoga';

//Type Definitions - Application Schema
const typeDefs = `
    type Query {
        greeting(name: String): String!
        title: String!
        price: Float!
        releaseYear: Int,
        rating: Float,
        inStock: Boolean!
        me: User!
        post: Post!
        add(numbers: [Int!]!): Float!
        grades: [Float!]!
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
        grades(){
            return [100,98,100]
        },

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
        },
        greeting(parent, args, ctx, info){
            if(args.name){
                return `Hello ${args.name}`
            }
            return "Hello"
        },
        add(parent, args){
            if(args.numbers.length !== 0){
                return args.numbers.reduce((total, cur) => total + cur);
            }
            return 0
        }
    },


}

const server = new GraphQLServer({typeDefs, resolvers})

server.start(() => {
    console.log('Server is up and running')
})
