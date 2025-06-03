import express from 'express';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    loginUser,
    updateUser
} from '../controller/userController.js';

const userRouter = express.Router();

 userRouter.get('/get', getUsers);
 userRouter.post('/signup', createUser);
 userRouter.post('/login', loginUser);
 userRouter.get('/get/:id', getUserById);
 userRouter.put('/update/:id', updateUser);
 userRouter.delete('/delete/:id', deleteUser);

export default  userRouter;
