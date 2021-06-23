/**
 * Issue Router.
 *
 * @author Kaj Berg
 * @version 1.0.0
 */

import express from 'express'

import { IssueController } from '../controller/issue-controller.js'
import { WebhookController } from '../controller/webhook-controller.js'

export const webhookRouter = express.Router()
const controller = new IssueController()
const webhookController = new WebhookController()

// Webhook Post
webhookRouter.post('/create', webhookController.index, controller.createPost)
