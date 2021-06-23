import axios from 'axios'

/**
 * Get response from gitlab.
 *
 * @param {string} url - Url to get.
 * @returns {object} The JSON response.
 */
export async function getFromGitlab (url) {
  const headers = {
    Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }

  return await axios.get(url, { headers })
}

/**
 * POST/PATCH response from gitlab.
 *
 * @param {object} configuration - Update configuration.
 * @returns {object} The JSON response.
 */
export async function updateGitlab (configuration) {
  const { method, url } = configuration

  const config = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }

  return await axios(config)
}

/**
 * Create data to match gitlabdata.
 *
 * @param {object} body - Reg.body.
 * @returns {object} - data
 */
export async function transformGitlabData (body) {
  // Toggling color and name of issue button at three last rows.
  const data = {
    iid: body.object_attributes.iid,
    title: body.object_attributes.title,
    description: body.object_attributes.description,
    state: body.object_attributes.state,
    updatedAt: body.object_attributes.updated_at,
    createdAt: body.object_attributes.created_at,
    author: body.user,
    closed: body.object_attributes.state !== 'opened',
    stateEvent: body.object_attributes.state !== 'opened' ? 'closed' : 'opened',
    toggleState: body.object_attributes.state === 'opened' ? 'close' : 'reopened'
  }
  return data
}
