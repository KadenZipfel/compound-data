class Form {
  constructor() {
    this.addressForm = document.querySelector('.addressForm');
    this.addressInput = document.querySelector('.addressInput');
    this.tokenName = document.querySelector('.tokenName');
    this.totalInterest = document.querySelector('.totalInterest');
    this.interestRate = document.querySelector('.interestRate');
    this.balance = document.querySelector('.balance');
    this.data;
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
          this.totalInterest.innerHTML += data.accounts[0].tokens[i].lifetime_supply_interest_accrued.value;
          this.balance.innerHTML += data.accounts[0].tokens[i].supply_balance_underlying.value;
    
          const tokenUrl = `https://api.compound.finance/api/v2/ctoken?addresses[]=${data.accounts[0].tokens[i].address}`;
          
          this._XHRRequest(tokenUrl, (response) => {
            const tokenData = JSON.parse(response);

            this.tokenName.innerHTML += tokenData.cToken[0].name;
            this.interestRate.innerHTML += tokenData.cToken[0].supply_rate.value;
          });
        }
      });
    });
  }
}

const form = new Form();
form.onSubmit();