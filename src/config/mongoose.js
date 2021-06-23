/**
 * Mongoose configuration.
 *
 * @author Kaj Berg
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const dbLogg = process.env.DB_CONNECTION_STRING

/**
 * Establishes a connection to a database.
 *
 * @returns {Promise} Resolves to this if connection succeeded.
 */
export const connectDB = async () => {
  // Bind connection to events (to get notifications).
  mongoose.connection.on('connected', () => console.log('Connected to Mongo DB atlas')
  )

  mongoose.connection.on('error', err => console.error(`Mongoose connection error has occurred: ${err}`))

  mongoose.connection.on('disconnected', () => console.log('Mongoose connection is disconnected.'))

  // If the Node process ends, close the Mongoose connection.
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose connection is disconnected due to application termination.')
      process.exit(0)
    })
  })

  // Connect to the server.
  return mongoose.connect(dbLogg, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}
