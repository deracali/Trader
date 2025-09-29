import cors from "cors";
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import adminRoute from "./route/adminRouter.js";
import giftcardRouter from './route/cardRequestRouter.js';
import cardRoutes from "./route/cardsRouter.js";
import CryptoRateRouter from "./route/cryptoRateRouter.js";
import CryptoRouter from "./route/cryptoRouter.js";
import userRouter from './route/userRouter.js';
import './telegramBot.js';



dotenv.config();

const app = express();



app.use(express.json());
// app.use(cors());
const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://cardzip-admin.netlify.app", // your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

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
app.use('/api/crypto-rate', CryptoRateRouter);
app.use('/api/crypto', CryptoRouter);


app.get('/', (req, res) => {
  res.send('User API is running...');
});


app.post("/webhook/telegram", (req, res) => {
  console.log("Received Telegram update:", req.body);
  res.sendStatus(200); // Respond with 200 to acknowledge
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
