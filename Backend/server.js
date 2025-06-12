import cors from "cors";
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import adminRoute from "./route/adminRouter.js";
import giftcardRouter from './route/cardRequestRouter.js';
import cardRoutes from "./route/cardsRouter.js";
import userRouter from './route/userRouter.js';




dotenv.config();

const app = express();



app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Routes
app.use('/api/users', userRouter);
app.use("/api/gift-cards", giftcardRouter);
app.use('/api/admin', adminRoute);
app.use('/api/cards', cardRoutes);


app.get('/', (req, res) => {
  res.send('User API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
