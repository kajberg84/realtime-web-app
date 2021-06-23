/**
 * Issue Router.
 *
 * @author Kaj Berg
 * @version 1.0.0
 */

import express from 'express'

import { IssueController } from '../controller/issue-controller.js'

export const issueRouter = express.Router()
const controller = new IssueController()

// Show all issues.
issueRouter.get('/', controller.showAll)

// create new issue.
issueRouter.get('/create', controller.createGet)
issueRouter.post('/create', controller.createPost)

// update.
issueRouter.post('/:id/edit', controller.update)

// Edit an issue.
issueRouter.get('/:id/edit', controller.edit)

// Toggle Issue state.
issueRouter.post('/state', controller.state)
