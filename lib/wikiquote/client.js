const superagent = require('superagent')

const config = {
  baseUri: 'https://ru.wikiquote.org/w/api.php'
}

exports.get = async (options) => {
  const response = await superagent.get(`${config.baseUri}${options.query}`)
  return response.body
}