import express from 'express';
import cors from 'cors';



const app = express();
const corsOptions = {
    origin: 'http://localhost:5173', 
    credentials: true, 
}
app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

import userRouter from './routes/user.route.js';
import resumeRouter from './routes/resume.route.js'
import jobRouter from './routes/job.route.js'
app.use('/api/v1/users', userRouter);
app.use('/api/v1/users/resume' , resumeRouter)

app.use('/api/v1/jobs' , jobRouter)






export default app;