import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema({
    username: {
         type: String, 
         required: true, 
         unique: true ,
         trim: true,
         lowercase:true,
         index:true,
         minlength:3,
        },
    email: { 
        type: String,
         required: true,
          unique: true,
            trim: true,
            lowercase:true,
        },
    password: {
         type: String,
          required: true,
        },

    refreshToken:{
        type:String
    },
    verificationToken:{
       type:String,
       default:null
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verificationTokenExpiryDate:{
        type:Date,
        default:null
    },
    lastRequestedAt:{
        type:Date,
    },
    requestCount:{
        type:Number,
        default:0
    }
},{
    timestamps:true

});
userSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,20)
    next()
})
userSchema.pre("save", async function(next){
    if(!this.isModified('verificationToken')) return next();

    this.verificationToken = await bcrypt.hash(this.verificationToken,20)
    next()
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken =  function(){
return jwt.sign(
    {
        _id:this._id,
        email:this.email,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)

}
userSchema.methods.generateRefreshToken =function(){
  return  jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User=mongoose.model('User',userSchema);