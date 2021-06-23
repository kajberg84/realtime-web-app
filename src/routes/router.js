/**
 * Main Router.
 *
 * @author Kaj Berg
 * @version 1.0.0
 */

import express from 'express'
import { issueRouter } from './issue-router.js'
import { webhookRouter } from './webhook-router.js'

export const router = express.Router()

router.use('/', issueRouter)
router.use('/webhook', webhookRouter)

// Catch 404 as last route
router.use('*', (req, res, next) => {
  const error = new Error()
  error.status = 404
  error.message = 'Not Found'
  next(error)
})
