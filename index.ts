import { GraphQLServer } from 'graphql-yoga';
import {users, comments, posts} from './database';
import { v4 as uuidv4 } from 'uuid';
import {resourceExists} from "./utils";

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
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        post: Post!
        add(numbers: [Int!]!): Float!
        grades: [Float!]!
        comments: [Comment!]!
    }
    
    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID!): Comment!
    }
    
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]
        comments: [Comment!]
    }
    
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User
        comments: [Comment!]
    }
    
    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`

//Resolvers
const resolvers = {
    Query: {
        comments(){
            return comments
        },
        users(parent, args){
            if(args.query){
                return users.filter(user => user.name[0].toLowerCase() === args.query.toLocaleLowerCase())
            }
            return users;
        },
        posts(parent, args){
            if(args.query){
                return posts.filter(post => post.title.includes(args.query) || post.body.includes(args.query))
            }
            return posts;
        },
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
        greeting(parent, args){
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

    Mutation: {
        createUser(parent, args){
            if(args){
                const {name, email, age} = args;
                const emailTaken = resourceExists(users, email, "email");
                if(emailTaken){
                    throw new Error('Email Taken');
                }
                const id = uuidv4();
                const user = {
                    id,
                    name,
                    email,
                    age
                }
                users.push(user);
                return user;

            }
        },

        createPost(parent, args){
            if(args){
                const { author } = args;
                const validAuthor = resourceExists(users, author, "id");
                if(!validAuthor){
                    throw new Error('Author does not exist')
                }
                const id = uuidv4();
                const post = {
                    id,
                   ...args
                }

                posts.push(post)
                return post;
            }
        },

        createComment(parent, args){
            if(args){
                const {author, post} = args;
                const user = resourceExists(users, author, "id");
                if(!user){
                    throw new Error('User does not exist')
                }
                const postFound = resourceExists(posts, post, "id");
                if(!postFound || !postFound.published ){
                    throw new Error('Post does not exist')
                }
                const comment = {
                    id: uuidv4(),
                    ...args
                }

                comments.push(comment);

                return comment
            }
        }
    },

    Post: {
        author(parent){
            return users.find(user => user.id === parent.author);
        },
        comments(parent){
            return comments.filter(comment => comment.post === parent.id)
        }
    },
    User: {
        posts(parent){
            return posts.filter(post => post.author === parent.id);
        },
        comments(parent){
            return comments.filter(comment => comment.author === parent.id)
        }
    },
    Comment: {
        author(parent){
            return users.find(user => user.id === parent.author)
        },
        post(parent){
            return posts.find(post => post.id === parent.post)
        }
    }
}

const server = new GraphQLServer({typeDefs, resolvers})

server.start(() => {
    console.log('Server is up and running')
})
