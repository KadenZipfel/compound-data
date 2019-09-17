const fetch = require('node-fetch');

const address = '0x8d093c8c70b5b5ba375d2d301c52d5b9d5ec79e3';

fetch(`https://api.compound.finance/api/v2/account?addresses[]=${address}`)
  .then(response => {
    if(response.status !== 200) {
      console.log('Error ', response.status);
      return;
    }

    response.json().then(data => {
      data.accounts[0].tokens.forEach(token => {
        console.log(token);
        console.log(token.lifetime_supply_interest_accrued);
      });
    });
  })
  .catch(err => {
    console.log('Fetch error ', err);
  });
