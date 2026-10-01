const express=require('express')
const {registerUser,verifyOtp,loginUser,logout,getme,updateProfile,changePassword,uploadImage,upload}=require('../Controllers/auth.controller')
const {checkforAuth}=require('../middleware.js/auth.middleware')
const router=express.Router();

router.post('/register',registerUser);
router.post('/verify-otp',verifyOtp);
router.post('/login',loginUser)
router.get('/logout',logout)
router.get('/me',checkforAuth,getme)
router.patch('/update-profile/:id',checkforAuth,updateProfile)
router.patch('/change-password',checkforAuth,changePassword)
router.post('/upload-image',checkforAuth,upload.single('image'),uploadImage)

module.exports=router