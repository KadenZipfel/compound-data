class Form {
  constructor() {
    this.addressForm = document.querySelector('.addressForm');
    this.addressInput = document.querySelector('.addressInput');
    this.hero = document.querySelector('.hero');
  }

  _XHRRequest(url, callback) {
    const xhr = new XMLHttpRequest();
    
    xhr.open('GET', url, true);
    xhr.send();
  
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback(xhr.responseText);
      }
    }
  }

  onSubmit() {
    this.addressForm.addEventListener('submit', (e) => {
      e.preventDefault();
    
      const address = this.addressInput.value;
    
      const addressUrl = `https://api.compound.finance/api/v2/account?addresses[]=${address}`;
    
      this._XHRRequest(addressUrl, (response) => {
        const data = JSON.parse(response);
        
        for(let i = 0; i < data.accounts[0].tokens.length; i++) {
          const tokenUrl = `https://api.compound.finance/api/v2/ctoken?addresses[]=${data.accounts[0].tokens[i].address}`;
          
          this._XHRRequest(tokenUrl, (response) => {
            const tokenData = JSON.parse(response);

            // Create asset box
            const asset = document.createElement('div');
            asset.className = 'asset';
            this.hero.appendChild(asset);

            // Add name
            const name = document.createElement('h4');
            name.className = 'asset__name';
            name.innerHTML = tokenData.cToken[0].name;
            asset.appendChild(name);

            // Add interest rate
            const interestRate = document.createElement('p');
            interestRate.className = 'asset__value';
            interestRate.innerHTML = tokenData.cToken[0].supply_rate.value;
            asset.appendChild(interestRate);

            // Add balance
            const balance = document.createElement('p');
            balance.className = 'asset__value';
            balance.innerHTML = data.accounts[0].tokens[i].supply_balance_underlying.value;
            asset.appendChild(balance);

            // Add earned interest
            const earnedInterest = document.createElement('p');
            earnedInterest.className = 'asset__value';
            earnedInterest.innerHTML = data.accounts[0].tokens[i].lifetime_supply_interest_accrued.value;
            asset.appendChild(earnedInterest);

            // Add yearly interest
            const yearlyInterest = document.createElement('p');
            yearlyInterest.className = 'asset__value';
            yearlyInterest.innerHTML = data.accounts[0].tokens[i].supply_balance_underlying.value * tokenData.cToken[0].supply_rate.value;
            asset.appendChild(yearlyInterest);
          });
        }
      });
    });
  }
}

const form = new Form();
form.onSubmit();