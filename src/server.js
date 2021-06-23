/**
 * The starting point.
 *
 * @author Kaj Berg
 * @version 1.0.0
 */

import express from 'express'
import hbs from 'express-hbs'
import logger from 'morgan'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { router } from './routes/router.js'
import dotenv from 'dotenv'
import session from 'express-session'
import helmet from 'helmet'

// Socket.io: To add Socket.io support
import http from 'http'
import { Server } from 'socket.io'

dotenv.config()

/**
 * The main function of the application.
 */
const app = express()
const directoryFullName = dirname(fileURLToPath(import.meta.url))

// Enable body parsing of application/json
// Populates the request object with a body object (req.body)
app.use(express.json())

// Set morgan logger
app.use(logger('dev'))
// Serve static files.
app.use(express.static(join(directoryFullName, '..', 'public')))

// Add Security Policy for externals scripts
app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-eval'", 'cdn.jsdelivr.net', 'cdn.jsdelivr.net', 'code.jquery.com'],
      'img-src': ["'self'", 'secure.gravatar.com'],
      'style-src': ["'self'", 'cdn.jsdelivr.net']
    }
  })
)
// View engine setup.
app.engine('hbs', hbs.express4({
  defaultLayout: join(directoryFullName, 'views', 'layouts', 'default'),
  partialsDir: join(directoryFullName, 'views', 'partials')
}))
app.set('view engine', 'hbs')
app.set('views', join(directoryFullName, 'views'))

// Parse requests of the content type application/x-www-form-urlencoded.
// Populates the request object with a body object (req.body).
app.use(express.urlencoded({ extended: false }))

// Socket.io: Add socket.io to the Express project
const server = http.createServer(app)
const io = new Server(server)

// Socket.io; Log when users connect/disconnect
io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})
// Session Options
const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false, // Resave even if a request is not changing the session.
  saveUninitialized: false, // Don't save a created but not modified session.
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: parseInt(process.env.SESSION_MAX_AGE)
  }
}
app.use(session(sessionOptions))

// Middleware to be executed before the routes.
app.use((req, res, next) => {
  // Flash messages - survives only a round trip.
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }

  // Pass the base URL to the views.
  res.locals.baseURL = process.env.BASE_URL

  if (req.session.user) {
    res.locals.user = req.session.user
  }

  // Socket.io: Add Socket.io to the Response-object to make it available in controllers.
  res.io = io

  next()
})

// Set routing
app.use('/', router)

// Error handler.
app.use((err, req, res, next) => {
  // 404 Not Found.
  if (err.status === 404) {
    res.status(404)
  }
  // Render the error page.
  res.status(err.status || 500)
    .render('errors/error', { error: err })
})

// Server listen
server.listen(process.env.MY_PORT, (req, res) => {
  console.log(`Server listening to port ${process.env.MY_PORT}.`)
})
