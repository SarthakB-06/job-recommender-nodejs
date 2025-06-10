import mongoose ,{ Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resumeUrl:{
        type:String,
        default:""
    },
    resumeUploaded:{
        type:Boolean,
        default:false
    },
    parsedResumeData:{
        type:Object,
        default:null
    },
    resumeParsedAt:{
        type:Date,
        default:null
    },
    preferences: {
        defaultLocation: {
          type: String,
          default: ''
        },
        salary: {
          min: {
            type: Number,
            default: null
          },
          max: {
            type: Number,
            default: null
          }
        },
        jobTypes: {
          type: [String],
          default: []
        },
        notifications: {
          email: {
            type: Boolean,
            default: true
          },
          jobAlerts: {
            type: Boolean,
            default: true
          },
          weeklyDigest: {
            type: Boolean,
            default: false
          }
        }
      },
      manualSkills: {
        type: [String],
        default: []
      }
    
},{timestamps:true}) 


export const User = mongoose.model("User",userSchema)