import express from 'express';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    loginUser,
    updateUser,
    sendResetCode,
    resetPasswordWithCode
} from '../controller/userController.js';

const userRouter = express.Router();

 userRouter.get('/get', getUsers);
 userRouter.post('/signup', createUser);
 userRouter.post('/login', loginUser);
 userRouter.get('/get/:id', getUserById);
 userRouter.put('/update/:id', updateUser);
 userRouter.delete('/delete/:id', deleteUser);

 // New password reset routes
 userRouter.post('/reset-code', sendResetCode);          // Send code to user email
 userRouter.post('/reset-password', resetPasswordWithCode); // Verify code and reset password

export default  userRouter;
