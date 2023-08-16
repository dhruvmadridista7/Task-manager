const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');


// const userOneId = new mongoose.Types.ObjectId();
// const userOne = {
//     _id : userOneId,
//     name : 'Nikhil',
//     email : 'nikhil@gmail.com',
//     password : 'nikhil@123',
//     tokens : [{
//         token : jwt.sign({ _id : userOneId }, process.env.JWT_SECRET)
//     }]
// }

beforeEach(setupDatabase);

// beforeEach(async () => {
//     // console.log('beforeEach')
//     await User.deleteMany();
//     await new User(userOne).save();
//     // OR
//     // const user = new User(userOne);
//     // await user.save();
// })

// afterEach(() => {
//     console.log('afterEach');
// })

test('Should signup a new user', async () => {
    // await request(app).post('/users').send({
    //     name : 'Dhruv',
    //     email : 'dhruv@gmail.com',
    //     password : 'Dhruv16199*'
    // }).expect(201);

    // Advance Assertion
    const response = await request(app).post('/users').send({
        name : 'Dhruv',
        email : 'dhruv@gmail.com',
        password : 'Dhruv16199*'
    }).expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    // expect(response.body.user.name).toBe('Dhruv');    //But we are not using this as but expect has another assertion we can use when we're working with objects.
    expect(response.body).toMatchObject({
        user : {
            name : 'Dhruv',
            email : 'dhruv@gmail.com'
        },
        token : user.tokens[0].token
    })
    // This below assertion is for checking that we are not storing plain text password in the database
    expect(user.password).not.toBe('Dhruv16199*');
})


test('Should login a user', async () => {
    // await request(app).post('/users/login').send({
    //     email : userOne.email,
    //     password : userOne.password
    // }).expect(200);

    // Advance Assewrtions
    const response = await request(app).post('/users/login').send({
        email : userOne.email,
        password : userOne.password
    }).expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
})


test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        // email : 'Himanshu@gmail.com',
        email : userOne.email,
        password : 'Himanshu@1234'
    }).expect(400);
})


test('Should get profile for user', async () => {
    // await request(app).get('/users/me').send().expect(200);
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Advance assertion to check user is deleted or not
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId);
    // expect({}).toBe({})     //it will fail the testcase , because objects are never equal to each other even though they have same properties and values
    // expect({}).toEqual({})     //user this to compare objects, it will pass the testcases
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user feilds', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name : 'Dhruv'
        })
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Dhruv')
})

test('Should not update invalid user feilds', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location : 'Palanpur'
        })
        .expect(400)
})



//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated