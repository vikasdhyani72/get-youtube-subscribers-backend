import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import Redoc from 'redoc-express'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/subscribers', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err))

const subscriberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subscribedChannel: { type: String, required: true },
})

const Subscriber = mongoose.model('Subscriber', subscriberSchema)

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Subscriber API',
      version: '1.0.0',
      description: 'API documentation for managing subscribers',
    },
    servers: [
      {
        url: process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/index.js'],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)

// Swagger UI Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Redoc Setup
app.get('/redoc', Redoc({ specUrl: `/api-docs.json` }))

// API Endpoints

/**
 * @swagger
 * /api/subscribers/names:
 *   get:
 *     summary: Get all subscriber names
 *     description: Retrieve all subscriber names
 *     responses:
 *       200:
 *         description: List of subscriber names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/api/subscribers/names', async (req, res) => {
  try {
    const names = await Subscriber.find({}, 'name') // Fetch only 'name'
    res.status(200).json(names.map((subscriber) => subscriber.name)) // Send an array of names
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving subscriber names',
      error: error.message,
    })
  }
})

/**
 * @swagger
 * /api/subscribers:
 *   get:
 *     summary: Get all subscribers
 *     description: Retrieve all subscribers (name, ID, and subscribedChannel)
 *     responses:
 *       200:
 *         description: List of subscribers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   subscribedChannel:
 *                     type: string
 */
app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find() // Fetch all fields
    res.status(200).json(subscribers) // Send full details (name, ID, and subscribedChannel)
  } catch (err) {
    res.status(500).json({
      message: 'Error retrieving subscribers',
      error: err.message,
    })
  }
})

/**
 * @swagger
 * /api/subscribers/{id}:
 *   get:
 *     summary: Get a subscriber by ID
 *     description: Retrieve a subscriber by their unique ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the subscriber
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscriber details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 subscribedChannel:
 *                   type: string
 *       404:
 *         description: Subscriber not found
 */
app.get('/api/subscribers/:id', async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id) // Get subscriber by ID
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' })
    }
    res.status(200).json(subscriber) // Send subscriber data back
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching subscriber details',
      error: error.message,
    })
  }
})

/**
 * @swagger
 * /api/subscribers:
 *   post:
 *     summary: Create a new subscriber
 *     description: Add a new subscriber with name and subscribed channel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subscribedChannel:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscriber created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating subscriber
 */
app.post('/api/subscribers', async (req, res) => {
  const { name, subscribedChannel } = req.body
  if (!name || !subscribedChannel) {
    return res
      .status(400)
      .json({ message: 'Name and subscribedChannel are required' })
  }

  try {
    const subscriber = new Subscriber({ name, subscribedChannel })
    await subscriber.save()
    res.status(201).json(subscriber)
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error creating subscriber', error: err.message })
  }
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Swagger docs available on http://localhost:${PORT}/api-docs`)
  console.log(`Redoc docs available on http://localhost:${PORT}/redoc`)
})
