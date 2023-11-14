const mongoose=require('mongoose');
const ConnectedToDb=()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/signin')
    .then((conn)=>{
        console.log(`Database Connected : ${conn.connection.host}`);
    })
    .catch((error)=>{
        console.log(`${error}`);
    })
}
module.exports=ConnectedToDb;