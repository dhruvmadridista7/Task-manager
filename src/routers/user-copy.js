const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();


// router.get('/test', (req,res) => {
//     res.send('from new file');
// })

router.post('/users', async (req,res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user,token});
    } catch (e) {
        res.status(400).send();
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        // res.send({user, token});
        // For password and token hiding
        // res.send({user : user.getPublicProfile(), token});   //no need to use new function as we can use to.JSON and do the same 
        res.send({user, token});
    } catch (e) {
        res.status(400).send();
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tkn) => {
            return tkn.token !== req.token;
        })
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
})


// router.get('/users', auth ,async (req, res) => {
//     try {
//         const users = await User.find({});
//         res.send(users);
//     } catch (e) {
//         res.status(500).send();
//     }
// })

router.get('/users/me', auth ,async (req, res) => {
    res.send(req.user);
})


// As in above route we are getting user profile that is kind of similer to getting user by id means we are getting user profile,
// But for security we can fetch other user by id if they don't have their userid and password
// router.get('/users/:id', async (req,res) => {
//     const _id = req.params.id;

//     try {
//         const user = await User.findById(_id);
//         if(!user) {
//             return res.status(404).send();
//         }

//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     }
// })

// router.patch('/users/:id', async (req,res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['name', 'email', 'password', 'age'];
//     // const isValidOperation = updates.every((update) => {
//     //     return allowedUpdates.includes(update);
//     // })
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

//     if(!isValidOperation) {
//         return res.status(400).send({ error : 'Invalid updates!' });
//     }

//     try {
//         const user = await User.findById(req.params.id);
//         updates.forEach((update) => {
//             user[update] = req.body[update];
//         });
//         await user.save();

//         // This one line changed because it is bypassing the updates
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true });

//         if(!user) {
//             res.status(404).send();
//         }

//         res.send(user);
//     } catch (e) {
//         res.status(400).send();
//     }
// })
router.patch('/users/me', auth, async (req,res) => {
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
        // const user = await User.findById(req.params.id);  //don't need this line as we are getting user data from middleware auth itself
        // so req.user is our user data that we are getting from auth
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        });
        await req.user.save();

        // This one line changed because it is bypassing the updates
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true });

        res.send(req.user);
    } catch (e) {
        res.status(400).send();
    }
})

// router.delete('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id);
//         if(!user) {
//             res.status(404).send();
//         }

//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     }
// })
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})



const upload = multer({
    // dest : 'avatar',
    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image file'));
        }

        cb(undefined, true);
    }
})

// router.post('/users/me/avatar', upload.single('avatar'), (req,res) => {
//     res.send();
// }, (error, req, res, next) => {
//     res.status(400).send({error : error.message});
// })

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error : error.message});
})


router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar) {
            throw new Error();
        }

        // req.header('Content-Type', 'application/json');  //By default it is set to this by express
        req.header('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
})



module.exports = router;