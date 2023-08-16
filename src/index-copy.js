const express = require('express')
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');
const userRouter = require('./routers/user');

const app = express();
const port = process.env.PORT || 3000;


//============ Understanding middleware=========================
/*
app.use((req,res,next) => {
    // console.log(req.method, req.path)
    // next();
    if(req.method === 'GET') {
        res.send('GET request are disabled');
    } else {
        next();
    }
})

app.use((req,res,next) => {
    res.status(503).send("site is under maintenence try after some time");
})

// 
// without middleware : new request -> run route handler
// 
// with middleware : new request -> do something -> run route handler
// 
// ======================================================================
*/


// ==================== adding files ===========================
/*
const multer = require('multer');

const upload = multer({
    dest : 'images',
    limits : {
        fileSize : 1000000
    },
    fileFilter (req, file, cb) {
        // for checking with single file extension
        // if(!file.originalname.endsWith('.pdf')) {
        //     return cb(new Error('Please upload a PDF file'));
        // }

        if(!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload a doc or docx file'));
        }

        cb(undefined, true);
    }
})

// const errorMiddleware = (req,res,next) => {
//     throw new Error('From my middleware');
// }   

// app.post('/upload', errorMiddleware, (req,res) => {
//     res.send();
// }, (error, req, res, next) => {
//     res.status(400).send({error : error.message});
// })

app.post('/upload', upload.single('upload'), (req,res) => {
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error : error.message});
})
*/
// =============================================================



app.use(express.json());    //Parse the jason to create an object
app.use(userRouter);
app.use(taskRouter);

// const router = new express.Router();
// router.get('/test', (req, res) => {
//     res.send('This is from my other router');
// })
// app.use(router);



// app.post('/users', (req,res) => {
//     // console.log(req.body);
//     // res.send('Testing');

//     const user = new User(req.body);

//     user.save().then(() => {
//         res.status(201).send(user);
//     }).catch((e) => {
//         res.status(400).send(e);
//         // res.send(e);
//     })
// })
app.post('/users', async (req,res) => {
    // console.log(req.body);
    // res.send('Testing');

    const user = new User(req.body);

    try {
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        res.status(400).send();
    }
})


// app.get('/users', (req, res) => {
//     User.find({}).then((users) => {
//         res.send(users);
//     }).catch((e) => {
//         res.status(500).send();
//     })
// })
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (e) {
        res.status(500).send();
    }
})


// app.get('/users/:id', (req,res) => {
//     // console.log(req.params);
//     const _id = req.params.id;

//     User.findById(_id).then((user) => {
//         if(!user) {
//             return res.status(404).send();
//         }

//         res.send(user);
//     }).catch((e) => {
//         res.status(500).send();
//     })

// })
app.get('/users/:id', async (req,res) => {
    const _id = req.params.id;

    try {
        const user = await User.findById(_id);
        if(!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
})


app.patch('/users/:id', async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    // const isValidOperation = updates.every((update) => {
    //     return allowedUpdates.includes(update);
    // })
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({ error : 'Invalid updates!' });
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true });

        if(!user) {
            res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(400).send();
    }
})


// app.post('/tasks', (req,res) => {
//     const task = new Task(req.body);

//     task.save().then(() => {
//         res.status(201).send(task);
//     }).catch((e) => {
//         res.status(400).send(e);
//     })
// })
app.post('/tasks', async (req,res) => {
    const task = new Task(req.body);

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send();
    }
})

// app.get('/tasks', (req,res) => {
//     Task.find({}).then((tasks) => {
//         res.send(tasks);
//     }).catch((e) => {
//         res.status(500).send();
//     })
// })
app.get('/tasks', async (req,res) => {
    try {
        const tasks = await Task.find({});
        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }
})

// app.get('/tasks/:id', (req,res) => {
//     const _id = req.params.id;

//     Task.findById(_id).then((task) => {
//         if(!task){
//             return res.status(404).send();
//         }

//         res.send(task);
//     }).catch((e) => {
//         res.status(500).send();
//     })
// })
app.get('/tasks/:id', async (req,res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findById(_id);
        if(!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
})


app.listen(port, () => {
    console.log('Server is up on port')
})












// ========= Hasing password =================================================

const bcrypt = require('bcryptjs');

const myFn = async () => {
    const password = "Dhruv1234*";
    const hashedPassword = await bcrypt.hash(password, 8);

    console.log(password);
    console.log(hashedPassword);

    const isMatch = await bcrypt.compare('dhruv1234*', hashedPassword);
    console.log(isMatch);
}

// myFn();


// =====================JSON web Token==========================================

// const jwt = require('jsonwebtoken');

// const myFn = async () => {
//     const token = jwt.sign({ _id : 'abc123' }, 'thisismynewcourse', { expiresIn : '7 days' });
//     console.log(token);

//     const data = jwt.verify(token, 'thisismynewcourse');
//     console.log(data);
// }

// myFn();


// ======== understanding to.JSON() ==========================================
// const pet = {
//     name : 'Hal'
// }

// pet.toJSON = function () {
//     // console.log(this);
//     return this;
//     // return {};
// }

// console.log(JSON.stringify(pet));




// ===User Task Relationship========================================================

const Task = require('./models/task');
const User = require('./models/user');

const main = async () => {
    // get user info from task model adding owner feild
    // const task = await Task.findById('6489b876bae574782968fb92');   //here it is task id
    // await task.populate('owner');
    // console.log(task.owner);

    // get all tasks created by user
    // means get tasks info from user model by adding virtual tasks to user model
    const user = await User.findById('6489b7292e147c72c4e5b9d3');  //here it is owner id
    await user.populate('tasks');
    console.log(user.tasks);
}

// main();