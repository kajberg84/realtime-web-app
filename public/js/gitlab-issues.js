import '../socket.io/socket.io.min.js'

// Select baseURL and issueTemplate.
const baseURL = document.querySelector('base').getAttribute('href')
const issueTemplate = document.querySelector('#issue-template')

if (issueTemplate) {
  const hbsTemplate = window.Handlebars.compile(issueTemplate.innerHTML)

  // Create socket connection.
  const socket = window.io({ path: `${baseURL}socket.io` })
  socket.on('issue', arg => {
    console.log(arg)
    const issueString = hbsTemplate(arg)
    const div = document.createElement('div')
    div.innerHTML = issueString
    const issue = document.querySelector('.issue-' + arg.iid)
    // Prepend to show on top in list.
    if (issue) {
      issue.innerHTML = ''
      issue.prepend(div)
    } else {
      const issueList = document.querySelector('#all-issues')
      issueList.appendChild(div)
    }
  })
}
