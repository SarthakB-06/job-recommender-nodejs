import mongoose from "mongoose";


const jobSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    company:{
        type:String,
        required:true,
        trim:true
    },
    location:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    requirements:{
        type:String,
        required:true
    },
    skills:{
        type:[String],
        default:[]
    },
    salary: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'INR'
        }
      },
      type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
        default: 'Full-time'
      },
      experience: {
        type: String,
        default: 'Entry Level'
      },
      datePosted: {
        type: Date,
        default: Date.now
      },
      isActive: {
        type: Boolean,
        default: true
      }
},{timestamps:true})


export default mongoose.model('Job' , jobSchema)