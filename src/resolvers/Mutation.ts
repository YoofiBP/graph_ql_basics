import {resourceExists} from "../../utils";
import {v4 as uuidv4} from 'uuid';
import {PubSub} from "graphql-yoga";

const mutation = {
    createUser(parent, args, {db}) {
        if (args.data) {
            const {name, email, age} = args.data;
            const emailTaken = resourceExists(db.users, email, "email");
            if (emailTaken) {
                throw new Error('Email Taken');
            }
            const id = uuidv4();
            const user = {
                id,
                name,
                email,
                age
            }
            db.users.push(user);
            return user;

        }
    },

    updateUser(parent, args, {db}) {
        if (args) {
            const {userId, data} = args;
            const user = db.users.find(user => user.id === userId)
            if (!user) {
                throw new Error('User not found')
            }
            Object.keys(data).forEach(attribute => {
                if (user[attribute]) {
                    user[attribute] = data[attribute]
                }
            })
            return user;
        }
    },

    deleteUser(parent, args, {db}) {
        if (args) {
            const {userId} = args;
            const userIndex = db.users.findIndex(user => user.id === userId);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            const deletedUser = db.users.splice(userIndex, 1)[0];

            //remove all posts relating to author
            db.posts = db.posts.filter(post => {
                const toBeRemoved = post.author === userId

                if (toBeRemoved) {
                    //remove all comments relating to post
                    db.comments = db.comments.filter(comment => {
                        return comment.post !== post.id
                    })
                }
                return !toBeRemoved;
            });

            //remove all comments relating to author
            db.comments = db.comments.filter(comment => {
                return comment.author !== userId
            })

            return deletedUser;
        }
    },

    deletePost(parent, args, {db, pubSub}) {
        if (args) {
            const mutation = "DELETED";
            const {postId} = args;
            const post = db.posts.find(post => post.id === postId);

            if (!post) {
                throw new Error('Post does not exist')
            }
            //remove posts
            db.posts = db.posts.filter(post => post.id !== postId);

            //remove related comments
            db.comments = db.comments.filter(comment => comment.post !== postId)

            post.published && pubSub.publish('posts', {
                post: {
                    mutation,
                    data: post
                }
            })

            return post
        }
    },

    createPost(parent, args, {db, pubSub}) {
        if (args.data) {
            const mutation = "CREATED"
            const {author} = args.data;
            const validAuthor = resourceExists(db.users, author, "id");
            if (!validAuthor) {
                throw new Error('Author does not exist')
            }
            const id = uuidv4();
            const post = {
                id,
                ...args.data
            }

            db.posts.push(post)
            post.published && pubSub.publish('posts', {post: {mutation, data: post}})

            return post;
        }
    },

    updatePost(parent, {postId, data}, {db, pubSub}) {
        if (data) {
            const post = db.posts.find(post => post.id === postId);
            if (!post) {
                throw new Error('Post does not exist')
            }
            const originalPost = {...post};

            if (data.author) {
                const user = db.users.find(user => user.id === data.author)
                if (!user) {
                    throw new Error('User does not exist')
                }
            }

            Object.keys(data).forEach(key => {
                if (post[key] !== null || post[key] !== undefined) {
                    post[key] = data[key]
                }
            })


            const output = {
                mutation: '',
                data: post
            }

            if (originalPost.published && !post.published) {
                //fire delete
                pubSub.publish('posts', {
                    post: {
                        ...output, mutation: 'DELETED'
                    }
                })
            } else if (!originalPost.published && post.published) {
                //fire create
                pubSub.publish('posts', {
                    post: {
                        ...output, mutation: 'CREATED'
                    }
                })
            } else if (post.published) {
                //fire update
                pubSub.publish('posts', {
                    post: {
                        ...output, mutation: 'UPDATED'
                    }
                })
            }

            return post;
        }
    },

    createComment(parent, args, {db, pubSub}: { db: any; pubSub: PubSub }) {
        if (args) {
            const {author, post} = args.data;
            const user = resourceExists(db.users, author, "id");
            if (!user) {
                throw new Error('User does not exist')
            }
            const postFound = resourceExists(db.posts, post, "id");
            if (!postFound || !postFound.published) {
                throw new Error('Post does not exist')
            }
            const comment = {
                id: uuidv4(),
                ...args.data
            }

            db.comments.push(comment);

            pubSub.publish(`comments`, {
                comment: {
                    mutation: 'CREATED',
                    data: comment
                }
            })

            return comment
        }
    },

    deleteComment(parent, args, {db, pubSub}) {
        if (args) {
            const {commentId} = args;

            const comment = db.comments.find(comment => comment.id === commentId);

            if (!comment) {
                throw new Error('Comment does not exist')
            }

            db.comments = db.comments.filter(comment => comment.id !== commentId);

            pubSub.publish(`comments`, {
                comment: {
                    mutation: 'DELETED',
                    data: comment
                }
            })

            return comment;
        }
    },

    updateComment(parent, {commentId, data}, {db, pubSub}) {
        if (data) {
            //check if post exists
            const comment = db.comments.find(comment => comment.id === commentId);

            if (!comment) {
                throw new Error("Comment not found")
            }

            if (data.post) {
                const post = db.posts.find(post => post.id === data.post);
                if (!post) {
                    throw new Error('Post does not exist')
                }
            }

            if (data.author) {
                const user = db.users.find(user => user.id === data.author);
                if (!user) {
                    throw new Error('Post does not exist')
                }
            }

            Object.keys(data).forEach(key => {
                if (comment[key]) {
                    comment[key] = data[key]
                }
            })

            pubSub.publish(`comments`, {
                comment: {
                    mutation: 'UPDATED',
                    data: comment
                }
            })
            return comment;
        }
    }
}

export default mutation;