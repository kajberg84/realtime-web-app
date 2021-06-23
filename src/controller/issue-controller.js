/**
 * Issue controller.
 *
 * @author Kaj Berg
 * @version 1.0.0
 */

import { getFromGitlab, updateGitlab } from '../helpers/fetch.js'
/**
 *
 */
export class IssueController {
  /**
   * Displays a list of issues.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showAll (req, res, next) {
    const url = process.env.GITLAB_ISSUES
    try {
      let viewData = []

      // Get response from gitlab.
      const gitHook = await getFromGitlab(url)
      viewData = gitHook.data.map(issue => {
        const { iid, title, description, created_at: createdAt, updated_at: updatedAt, author, state } = issue

        // Toggling State.
        const closed = state !== 'closed'
        const stateEvent = closed ? 'opened' : 'closed'
        const toggleState = closed ? 'close' : 'reopen'

        return { iid, title, description, createdAt, updatedAt, author, closed, stateEvent, toggleState }
      })
      res.render('issues/list', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Edit an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async edit (req, res, next) {
    const { id } = req.params
    const url = process.env.GITLAB_ISSUES + '/' + id

    try {
      let viewData = []

      // Get response from gitlab.
      const issue = await getFromGitlab(url)
      const { iid, title, description, author } = issue.data
      viewData = { id, iid, title, description, author }
      res.render('issues/edit', { viewData })
    } catch (error) {
      error.status = 404
      error.message = 'No Issues to show'
      next(error)
    }
  }

  /**
   * Update an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    const { title, description } = req.body
    const { id } = req.params

    // Create params
    const params = ['title=' + title, 'description=' + description]

    // Creating url for update data.
    const url = process.env.GITLAB_ISSUES + '/' + id + '?' + params.join('&')
    try {
      const options = { method: 'PUT', url: encodeURI(url) }

      // Update on GitLab
      await updateGitlab(options)

      req.session.flash = { type: 'success', text: 'The issue was updated successfully.' }
      res.redirect('./..')
    } catch (error) {
      error.status = 404
      error.message = 'Could not update issue'
      next(error)
    }
  }

  /**
   * Toggle issue state.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async state (req, res, next) {
    const { iid, state } = req.body
    const params = ['state_event=' + state]

    // Creating url for update state.
    const url = process.env.GITLAB_ISSUES + '/' + iid + '?' + params.join('&')
    try {
      const options = { method: 'PUT', url }
      // POST/PATCH response from gitlab.
      await updateGitlab(options)
      req.session.flash = { type: 'success', text: 'State updated successfully.' }
      res.redirect('./')
    } catch (error) {
      error.status = 404
      error.message = 'Could not update state'
      next(error)
    }
  }

  /**
   * Render a form for create an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async createGet (req, res, next) {
    try {
      const viewData = {
        title: '',
        description: ''
      }
      res.render('issues/create', { viewData })
    } catch (error) {
      error.status = 404
      error.message = 'No issues to show'
      next(error)
    }
  }

  /**
   * Post to create an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async createPost (req, res, next) {
    try {
      // Socket.io: Send the created issue to all subscribers.
      res.io.emit('issue', await req.body)

      if (req.headers['x-gitlab-event']) {
        res.status(200).send('Hook accepted')
        return
      }
      req.session.flash = { type: 'success', text: 'The issue was created successfully.' }
      res.redirect('./')
    } catch (error) {
      let validationErrors = []

      // Cleanup and create list of error message.
      validationErrors = error.toString()
        .split(':')
        .filter(text => text !== 'Error')
      res.render('issues/create', {
        validationErrors,
        data: req.body
      })
    }
  }
}
