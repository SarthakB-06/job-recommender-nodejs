import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      jobId: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: String,
      salary: String,
      link: String,
      description: String,
      skills: [String],
      datePosted: String,
      jobType: String,
      matchScore: Number,
      savedAt: {
        type: Date,
        default: Date.now
      }
},{timestamps:true})

savedJobSchema.index({ user: 1, jobId: 1 }, { unique: true });

export default mongoose.model('SavedJob', savedJobSchema);