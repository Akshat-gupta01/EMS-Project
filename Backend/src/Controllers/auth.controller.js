const {User, Role, Permission, Department}=require('../models')
const {Otp}=require('../models')
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const multer=require('multer')
const { where } = require('sequelize');
const sendEmail=require('../services/email.services');
const {generateOtp,getOtpHtml}=require('../utils/utils');


async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({
            username: username,
            email: email,
            password: hash,
            roleId: null
        });

        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        
        // Remove any old OTPs for this email before creating new one
        await Otp.destroy({ where: { email } });

        await Otp.create({
            userId: user.id,
            email: email,
            otpHash: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        try {
            sendEmail(email, "OTP Verification", "Your OTP is " + otp, getOtpHtml(otp));
            console.log("OTP sent to", email);
        } catch (mailErr) {
            console.error("Failed to send email:", mailErr);
        }

        res.status(201).json({
            message: 'User registered successfully. Please verify OTP sent to your email.',
            verified: user.isVerified
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
}

async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body;
        const otpRecord = await Otp.findOne({
            where: { email: email }
        });
        
        if (!otpRecord) {
            return res.status(400).json({ message: 'No OTP request found for this email' });
        }

        // Check if OTP has expired
        if (new Date() > new Date(otpRecord.expiresAt)) {
            await otpRecord.destroy(); // Clean up expired OTP
            return res.status(400).json({ message: 'OTP has expired. Please register again.' });
        }

        const ismatch = await bcrypt.compare(otp, otpRecord.otpHash);
        if (!ismatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const user = await User.findOne({
            where: { email: email }
        });

        if (user) {
            await user.update({
                isVerified: true
            });
        }

        await otpRecord.destroy();

        res.status(200).json({
            message: 'User verified successfully'
        });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        
        // 1. Verify user exists
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        // 2. Match password
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            return res.status(400).json({
                message: 'Invalid password'
            });
        }

        // 4. Generate token with 1 day expiration
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            // secure: true
        });

        const isAdmin = user.roleId === 1;
        res.status(200).json({
            message: isAdmin ? 'Admin logged in successfully' : 'User logged in successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roleId: user.roleId,
                status: user.status,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
}

async function logout(req,res) {
    await res.clearCookie('token')
    res.status(200).json({
        message:'User logged out successfully'
    })
}

async function getme(req, res) {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            include: [
                {
                    model: Role,
                    include: [Permission]
                },
                {
                    model: Department,
                    as: 'department'
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const permissions = user.Role ? user.Role.Permissions.map(p => p.name) : [];

        res.status(200).json({
            message: 'User profile fetched successfully',
            permissions,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roleId: user.roleId,
                role: user.Role?.name || null,
                departmentId: user.departmentId,
                department: user.department?.departmentName || null,
                status: user.status,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function updateProfile(req, res) {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        await User.update({
            username: req.body.username,
            email: req.body.email
        }, { where: { id: id } });

        res.status(200).json({
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
}

async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }

        const user = await User.findOne({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const ismatch = await bcrypt.compare(oldPassword, user.password);
        if (!ismatch) {
            return res.status(400).json({
                message: 'Invalid old password'
            });
        }
        const updatedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({
            password: updatedPassword
        });
        res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

async function uploadImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        await User.update({ profilePhoto: req.file.filename }, { where: { id: req.user.id } });
        res.status(200).json({ message: "Image uploaded successfully", filename: req.file.filename });
    } catch (error) {
        console.error("Error in uploadImage:", error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
}

module.exports = { registerUser, verifyOtp, loginUser, logout, getme, updateProfile, changePassword, uploadImage, upload };

