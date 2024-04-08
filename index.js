import express from 'express';
import dotenv from 'dotenv'; // Import dotenv
import routes from './src/routes'; // Import routes file

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3000; // Use process.env.PORT or default to port 3000

// Add middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.AUTH_SECRET, cookie: { maxAge: 60000 }}))


// Use routes from the routes file
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
