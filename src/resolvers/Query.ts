const query = {
    comments(parent, args, {db}){
        return db.comments
    },
    users(parent, args, {db}){
        if(args.query){
            return db.users.filter(user => user.name[0].toLowerCase() === args.query.toLocaleLowerCase())
        }
        return db.users;
    },
    posts(parent, args, {db}){
        if(args.query){
            return db.posts.filter(post => post.title.includes(args.query) || post.body.includes(args.query))
        }
        return db.posts;
    },
    grades(parent, args, {db}){
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
    greeting(parent, args, {db}){
        if(args.name){
            return `Hello ${args.name}`
        }
        return "Hello"
    },
    add(parent, args, {db}){
        if(args.numbers.length !== 0){
            return args.numbers.reduce((total, cur) => total + cur);
        }
        return 0
    }
}

export default query;