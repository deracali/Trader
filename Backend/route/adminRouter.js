import express from 'express';
import {
    signIn,
    signUp,
    updateAdmin,
} from '../controller/adminController.js';

const adminRoute = express.Router();

adminRoute.post('/signup', signUp);
adminRoute.post('/signin', signIn);
adminRoute.put('/update/:id', updateAdmin); // e.g., /update/60f8...

export default adminRoute;
