import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generateToken } from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"

export const signup = async(req,res)=>{
           
    const {fullName, email, password}=req.body
      try { 
         // hash password

         if(!fullName ||!email || !password){
             return res.status(400).json({message :"all feild are requried"})
      }
          if(password.length<6){
            return res.status(400).json({message :"password should atleast 6 character"})
          }

          const user=await User.findOne({email})
          if(user){
              return res.status(400).json({message :"user already exist"})
          }

          const salt=await bcrypt.genSalt(10)

          const hashedPassword=  await bcrypt.hash(password,salt)

         const newUser=new User({
            fullName,
            email,
            password:hashedPassword
         })

         if(newUser){
                // genertae jwt token
                generateToken(newUser._id,res)
                await newUser.save();
                   return res.status(201).json({
                     _id:newUser._id,
                     fullName:newUser.fullName,
                     email:newUser.email,
                    profilePic:newUser.profilePic,
                    message :"user registered successfully"})
         }
         else{
            return res.status(400).json({message :"Invalid usser data"})
         }
      } catch (error) {
           console.log("Error in the signup",error.message)
              return res.status(500).json({message :"internal server error"})
      }      
   
} 


export const login = async (req,res)=>{
     const {email , password}=req.body
     try {
        const user=await User.findOne({email})
        if(!user){
         return res.status(400).json({message :'Invalid creadiantls'})
        }

      const isPasswordCorrect= await bcrypt.compare(password, user.password)

      if(!isPasswordCorrect){
            return res.status(400).json({message :'Invalid creadiantls'})
      }

      generateToken(user._id,res)

     return res.status(201).json({
                     _id:user._id,
                     fullName:user.fullName,
                     email:user.email,
                    profilePic:user.profilePic,
                    message :"user registered successfully"
      
      })
     } catch (error) {
      console.log("error in login",error.message)
       return res.status(500).json({message :'invalid crediantials'})

     }
}


export const logout = (req,res)=>{
  
   try {
       res.cookie("jwt","",{maxAge :0})
         return res.status(200).json({message :'logout successfully'})
   } catch (error) {
       console.log("error in logout",error.message)
       return res.status(500).json({message :'Error in logout'})
   }
}   

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    let profilePicUrl;

    // 1️⃣ If file upload (FormData + multer)
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path);
      profilePicUrl = uploadResponse.secure_url;
    }

    // 2️⃣ If base64 sent in JSON
    else if (req.body.profilePic) {
      profilePicUrl = await cloudinary.uploader.upload(req.body.profilePic)
        .then((result) => result.secure_url)
        .catch((err) => {
          return res.status(400).json({ message: "Invalid base64 image" });
        });
    }

    // 3️⃣ If no image sent
    else {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const checkAuth =async (req,res)=>{
     
   try {
       res.status(201).json(req.user);
   } catch (error) {
       console.log("error in check in user",error.message);
       res.status(500).json({message :"internal server error"})
   }

}