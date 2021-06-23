/**
 * Webhook controller.
 *
 * @author Kaj Berg
 * @version 1.0.0
 */
import { transformGitlabData } from '../helpers/fetch.js'
/**
 *
 */
export class WebhookController {
/**
 * Recieves a webook and returns only title.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
  async index (req, res, next) {
    req.body = transformGitlabData(req.body)
    next()
  }
}
