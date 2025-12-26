const path = require('path');
const mongoose = require('mongoose');

// load env
require('dotenv').config({ path: path.join(__dirname, '..', 'config', 'config.env') });

const connectDatabase = require('../config/database');
const User = require('../models/userModel');

connectDatabase();

const emailToMakeAdmin = 'VELANM.CSE2024@CITCHENNAI.NET';

async function makeAdmin() {
    try{
        // Wait for mongoose to be connected
        if (mongoose.connection.readyState !== 1) {
            await new Promise((resolve, reject) => {
                mongoose.connection.once('open', resolve);
                mongoose.connection.once('error', reject);
            });
        }

        const user = await User.findOne({ email: new RegExp(`^${emailToMakeAdmin}$`, 'i') });
        if(!user){
            console.log(`User with email ${emailToMakeAdmin} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save({ validateBeforeSave: false });
        console.log(`User ${user.email} updated to role: ${user.role}`);
        process.exit(0);
    }catch(err){
        console.error('Error making user admin:', err.message || err);
        process.exit(1);
    }
}

makeAdmin();
