// CRUD create read update delete

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

// This is not working for mongodb version 6.0.6, And also for above 5.0.0
// MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
//     if(error){
//         return console.log('Unable to connect to database!');
//     }

//     // console.log('Connected correctly');
//     // Create a database
//     const db = client.db(databaseName);

//     db.collection('users').insertOne({
//         name : 'Dhruv',
//         Age : 24
//     })

// })

const client = new MongoClient(connectionURL, { useNewUrlParser: true });

async function connectToMongoDB() {
    try {
        // Use connect method to connect to the server
        await client.connect();
        console.log("connected successfully to server");

        // db -> reference to out "task-manager" database
        const db = client.db(databaseName);

        // Perform database operation here. Make sure to await database operations
        // await db.collection('users').insertOne({
        //     name : 'Dhruv',
        //     age : 24
        // });

        await db.collection('users').insertOne({
            name : 'Nikhil',
            age : 25
        })
        .then((result) => {

            console.log(result);
        }).catch(() => {
            console.log('Error');
        })

        // close the connection when finished
        client.close();

    } catch (error) {
        console.log("Unable to connect to database");
    }
}

connectToMongoDB();