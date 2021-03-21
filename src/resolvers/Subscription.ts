import {PubSub} from "graphql-yoga";

const Subscription = {
    comment: {
        subscribe(parent, args, {pubSub}: { pubSub: PubSub }): any {
            return pubSub.asyncIterator('comments')
        }
    },
    post: {
        subscribe(parent, args, { pubSub}: { pubSub: PubSub }): any {
            return pubSub.asyncIterator('posts')
        }
    }
}

export default Subscription