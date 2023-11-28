const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello express");
});


mongoose.connect('mongodb+srv://mstell:admin123@cluster0.mnhamwg.mongodb.net', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDb Connected'))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req,res) => {
    try{
        const {username, password} = req.body;

        //check if user already exists
        const existingUser = await User.findOne({username});
        if (existingUser){
            return res.status(400).send({error: 'Username already exits'});
        }
        console.log('User Never reached here')

        //Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); //the number 10 is here the salt rounds
        //create a new user and save to database

        const user = new User({
            username,
            password: hashedPassword
        });
        await user.save();
        
        res.status(201).send({message: 'User registered successfully'});
    } catch (error){
        console.log('User not register',error);// This error shows up in your logs
        res.status(500).send ({error: 'Internal Server Error'});// This error is send to the browser
    }
});
// User Login Route
app.post('/login', async (req, res) => {
    const {username, password} = req.body
    try{
        const user = await User.findOne({ username });
        if(!user) {
            console.log('user not found attempting login');
            return res.status(401).send({ error: ' invalid username or password'});
        }
        //Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: ' invalid username or password'});
        }

        //create a JWT token
        const token = jwt.sign ({ userId: user._id }, 'yourJWTSecret', {expiresIn: '1h'});
        res.send({ token})
    } catch(error) {
        res.status(500).send({ error: 'internal server error'})
    }
}) ;

const PORT = process.env.PORT || 3000;
app.listen(PORT,() => {
    console.log(`server is running on port ${PORT}`);
});