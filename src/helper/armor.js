const { Armor } = require('@armor/core')

const axios = require('./axios')
const armor = new Armor({
  plugins: [axios()],
})

module.exports = armor
