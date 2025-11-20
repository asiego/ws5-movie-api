require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ws5';

app.use(cors()); // allow requests from any origin
app.use(express.json()); // parse JSON 

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        year: Number,
        director: String,
        rating: Number
    },
    { timestamps: true }
);

const Movie = mongoose.model('Movie', movieSchema);

// GET all-movies
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find({}).limit(50).lean();
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// GET movie by ID
app.get('/api/movies/:id', async (req, res) =>{
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        res.status(200).json(movie);
    } catch (error) {
        res.status(400).json({ error: 'Invalid ID' });
    }   
});

// POST Create
app.post('/api/movies', async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json(movie);
    } catch (error) {
        res.status(400).json({ error: 'Invalid movie data' });
    }
});

// PUT Update
app.put('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        } 
        res.status(200).json(movie);
    } catch (error) {
        res.status(400).json({ error: 'Invalid update data' });
    }
});

// DELETE
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' 
        });
        res.status(200).json({ message: 'Deleted', id: movie._id });
        } catch (error) {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

// Simple health route
app.get('/', (req, res) => {
    res.json({ message: 'WS-5 Movie API running'});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});