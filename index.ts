import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import authRoute from './src/routes/auth';
import passport from 'passport';
import {initializePassportConfig} from './passport-config';
import session from 'express-session';

dotenv.config();

initializePassportConfig(passport)

const app = express();
const port = process.env.PORT || 3000;

// Set up session middleware
app.use(session({
    secret: process.env.SESSION_SECRET!, // Use ! to assert non-null since dotenv.config() loads environment variables
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 } // You can include cookie options here
}));

// Initialize Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/', authRoute);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    // res.status(500).send(res,);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
