const { executeImgCmd } = require('../utils/localFiles');

module.exports = {

  'name': 'nft',
  'description': 'Dinero gratis (sigma male)',
  'aliases': [],
  'cooldown': 2000,

  execute(msg, args) {
    executeImgCmd(msg, 'nft', args[1]);
  },
};