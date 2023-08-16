const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type : String,
        required: true,
        minlength: 7,
        trim : true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cannot contain "password"');
            }
        }
    }, 
    age: {
        type : Number,
        default : 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number');
            }
        }
    },
    tokens: [{
        token : {
            type: String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
}, {
    timestamps : true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// userSchema.methods.getPublicProfile = function () {
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

// userschema.methods for methods on the instance and individual user
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign( { _id : user._id.toString() } , process.env.JWT_SECRET);

    user.tokens = user.tokens.concat( { token : token} );
    await user.save();

    return token;
}

//userschema.statics for methods on the actual User model.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( { email : email } );    //can also write {email} as shorthand property

    if(!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}


// middleware == This will run before saving the user details to the db
// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    // console.log(user.password,this.password);
    // console.log(user.isModified('password'));

    if (user.isModified('password')) { //this will check the password in db and user's pass and if it is modified then only will hash that passowrd and add into db
        user.password = await bcrypt.hash(user.password, 8);
    }
    // console.log('running');

    next();
})

// delete user tasks when user is removed   => This is not working why?
userSchema.pre('remove', async function(next) {

    const user = this;

    // console.log(user);
    // const _id = this.getQuery()._id;
    // console.log(_id);
    await Task.deleteMany({ owner: user._id });

    next();
})

const User = mongoose.model('User', userSchema);


module.exports = User;