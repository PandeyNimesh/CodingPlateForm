const redisClient = require("../config/redis");
const User = require("../models/user")
const validate = require('../utils/validator');
const submissions = require("../models/submission")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");


const register = async (req, res) => {
    try {
        // validate the data;
        validate(req.body);
        const { firstName, emailId, password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        let role = 'user'

        const user = await User.create({ firstName, emailId, password, role });
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role
        }
        console.log(reply);
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).json({
            user: reply,
            message: "Register Successfully"
        })
    }
    catch (err) {
        /// validation require for password()
        res.status(400).json({ message: err.message });
    }
}


const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");
        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: req.result.role,
        }

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).json({
            user: reply,
            message: "Loggin Successfully"
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message });

    }
}


const logout = async (req, res) => {

    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);
        //    Token add kar dung Redis ke blockList
        //    Cookies ko clear kar dena.....

        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.send("Logged Out Succesfully");

    }
    catch (err) {
        res.status(503).send("Error: " + err);
    }
}


const adminRegister = async (req, res) => {
    try {
        // validate the data;
        //   if(req.result.role!='admin')
        //     throw new Error("Invalid Credentials");  
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        //

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

const deleteProfile = async (req, res) => {

    try {

        const userId = req.result._id

        await User.findByIdAndDelete(userId)
        await Submission.deleteMany(userId);
        res.status(200).send("deleted successfully");
    }
    catch (error) {
        res.status(500).send("Internal server Error " + error);
    }
}


module.exports = { register, login, logout, adminRegister, deleteProfile };