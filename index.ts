import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';
import { resourceExists} from "./utils";


export let users = [
    {
        id: '1',
        name: "Naa Ayorkor",
        email: "naa@gmail.com",
        age: 20,
    },
    {
        id: '2',
        name: "Yoofi",
        email: "yoofi@gmail.com",
        age: 24,
    }
]

export let posts = [
    {
        id: "1",
        title: "First Post",
        body: "Post Body",
        published: true,
        author: "1"
    },
    {
        id: "2",
        title: "Second Post",
        body: "Post Body",
        published: true,
        author: "2"
    },
    {
        id: "3",
        title: "Third Post",
        body: "Post Body",
        published: true,
        author: "1"
    }
]

export let comments = [
    {
        id: "1",
        text: "First Comment",
        author: "1",
        post: "1"
    },
    {
        id: "2",
        text: "Second Comment",
        author: "1",
        post: "2"
    },
    {
        id: "3",
        text: "Third Comment",
        author: "2",
        post: "3"
    },
    {
        id: "4",
        text: "Fourth Comment",
        author: "2",
        post: "2"
    }
]

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
        createUser(data: CreateUserInput): User!
        deleteUser(userId: ID!): User
        
        createPost(data: CreatePostInput): Post!
        deletePost(postId: ID!): Post
        
        createComment(data: CreateCommentInput): Comment!
        deleteComment(commentId: ID!):Comment!
    }
    
    input CreateUserInput {
        name: String!
        email: String!
        age: Int
    }
    
    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }
    
    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
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
            if(args.data){
                const {name, email, age} = args.data;
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

        deleteUser(parent,args) {
          if(args){
              const {userId} = args;
              const userIndex = users.findIndex(user => user.id === userId);

              if(userIndex === -1){
                  throw new Error('User not found');
              }

              const deletedUser = users.splice(userIndex, 1)[0];

              //remove all posts relating to author
              posts = posts.filter(post => {
                  const toBeRemoved =  post.author === userId

                  if(toBeRemoved){
                      //remove all comments relating to post
                    comments = comments.filter(comment => {
                        return comment.post !== post.id
                    })
                  }
                  return !toBeRemoved;
              });

              //remove all comments relating to author
              comments = comments.filter(comment => {
                  return comment.author !== userId
              })

              return deletedUser;
          }
        },

        deletePost(parent, args){
            if(args){
                const {postId} = args;
                const post = posts.find(post => post.id === postId);

                if(!post){
                    throw new Error('Post does not exist')
                }
                //remove posts
                posts = posts.filter(post => post.id !== postId);

                //remove related comments
                comments = comments.filter(comment => comment.post !== postId)

                return post
            }
        },

        createPost(parent, args){
            if(args.data){
                const { author } = args.data;
                const validAuthor = resourceExists(users, author, "id");
                if(!validAuthor){
                    throw new Error('Author does not exist')
                }
                const id = uuidv4();
                const post = {
                    id,
                   ...args.data
                }

                posts.push(post)
                return post;
            }
        },

        createComment(parent, args){
            if(args){
                const {author, post} = args.data;
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
                    ...args.data
                }

                comments.push(comment);

                return comment
            }
        },

        deleteComment(parent, args){
            if(args){
                const {commentId} = args;

                const comment = comments.find(comment => comment.id === commentId);

                if(!comment){
                    throw new Error('Comment does not exist')
                }

                comments = comments.filter(comment => comment.id !== commentId);

                return comment;
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
