class Form {
  constructor() {
    this.addressForm = document.querySelector('.form');
    this.addressInput = document.querySelector('.form__input');
    this.assets = document.querySelector('.asset-list');
    this.error = document.querySelector('.error');
  }

  _XHRRequest(url, callback) {
    const xhr = new XMLHttpRequest();
    
    xhr.open('GET', url, true);
    xhr.send();
  
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        if(document.querySelector('.spinner')) {
          const spinner = document.querySelector('.spinner');
          this.assets.removeChild(spinner);
        }
        callback(xhr.responseText);
      } else if(xhr.status == 500) {
        this.error.style.display = 'block';
      }
    }
  }

  // https://stackoverflow.com/questions/6784894/add-commas-or-spaces-to-group-every-three-digits
  _commafy(num) {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
  }

  _switchTabOnClick(supply, borrow) {
    supply.addEventListener('click', () => {
      if(supply.classList.contains('asset__tab--active')) {
        return;
      }
      borrow.classList.remove('asset__tab--active');
      supply.classList.add('asset__tab--active');

      // Handle values
      const assetNav = supply.parentNode;
      const asset = assetNav.parentNode;
      const values = Array.from(asset.childNodes);

      values.forEach(value => {
        if(value.classList.contains('asset__values--supply')) {
          value.classList.add('asset__values--active');
        }
        if(value.classList.contains('asset__values--borrow')) {
          value.classList.remove('asset__values--active');
        }
      });
    });
    borrow.addEventListener('click', () => {
      if(borrow.classList.contains('asset__tab--active')) {
        return;
      }
      supply.classList.remove('asset__tab--active');
      borrow.classList.add('asset__tab--active');

      // Handle values
      const assetNav = supply.parentNode;
      const asset = assetNav.parentNode;
      const values = Array.from(asset.childNodes);

      values.forEach(value => {
        if(value.classList.contains('asset__values--borrow')) {
          value.classList.add('asset__values--active');
        }
        if(value.classList.contains('asset__values--supply')) {
          value.classList.remove('asset__values--active');
        }
      });
    });
  }

  onSubmit() {
    this.addressForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Remove old assets
      const oldAssets = document.querySelectorAll('.asset');
      oldAssets.forEach(asset => {
        asset.parentNode.removeChild(asset);
      });

      // Remove old error message
      this.error.style.display = 'none';
    
      const address = this.addressInput.value;
    
      const addressUrl = `https://api.compound.finance/api/v2/account?addresses[]=${address}`;
    
      this._XHRRequest(addressUrl, (response) => {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        this.assets.append(spinner);

        const data = JSON.parse(response);

        console.log('Data: ', data);

        if(data.accounts.length < 1) {
          spinner.parentNode.removeChild(spinner);
          this.error.style.display = 'block';
          return;
        }
        
        const tokenArray = data.accounts[0].tokens;
        
        for(let i = 0; i < tokenArray.length; i++) {
          const tokenUrl = `https://api.compound.finance/api/v2/ctoken?addresses[]=${tokenArray[i].address}`;

          this._XHRRequest(tokenUrl, (response) => {
            const tokenData = JSON.parse(response);

            console.log('Token Data: ', tokenData);

            // Create asset box
            const asset = document.createElement('div');
            asset.className = 'asset';
            this.assets.appendChild(asset);

            // Create asset header
            const header = document.createElement('div');
            header.className = 'asset__header';
            asset.appendChild(header);

            // Add icon
            const icon = document.createElement('img');
            icon.className = 'asset__icon'
            icon.src = `img/${tokenData.cToken[0].symbol.slice(1)}.svg`;
            header.appendChild(icon);

            // Add name
            const name = document.createElement('h4');
            name.className = 'asset__name';
            name.innerHTML = tokenData.cToken[0].name.slice(9);
            header.appendChild(name);

            // Create asset nav
            const nav = document.createElement('div');
            nav.className = 'asset__nav';
            asset.appendChild(nav);

            // Create asset nav supply tab
            const supply = document.createElement('a');
            supply.className = 'asset__tab asset__tab--supply asset__tab--active';
            supply.id = 'supply';
            supply.innerHTML = 'Supply';
            nav.appendChild(supply);

            // Create asset nav borrow tab
            const borrow = document.createElement('a');
            borrow.className = 'asset__tab asset__tab--borrow';
            borrow.id = 'borrow';
            borrow.innerHTML = 'Borrow';
            nav.appendChild(borrow);

            // Create asset supply value container
            const assetSupplyValues = document.createElement('div');
            assetSupplyValues.className = 'asset__values asset__values--supply asset__values--active';
            asset.appendChild(assetSupplyValues);

            // Add interest rate
            const supplyInterestRate = document.createElement('p');
            supplyInterestRate.className = 'asset__value';
            supplyInterestRate.innerHTML = `<strong>Interest Rate:</strong> ${(tokenData.cToken[0].supply_rate.value * 100).toFixed(2)}% APR`;
            assetSupplyValues.appendChild(supplyInterestRate);

            // Add balance
            const supplyBalance = document.createElement('p');
            supplyBalance.className = 'asset__value';
            supplyBalance.innerHTML = `<strong>Balance:</strong> $${this._commafy(parseInt(tokenArray[i].supply_balance_underlying.value).toFixed(2))}`;
            assetSupplyValues.appendChild(supplyBalance);

            // Add earned interest
            const earnedInterest = document.createElement('p');
            earnedInterest.className = 'asset__value';
            earnedInterest.innerHTML = `<strong>Interest Earned:</strong> $${this._commafy(parseInt(tokenArray[i].lifetime_supply_interest_accrued.value).toFixed(2))}`;
            assetSupplyValues.appendChild(earnedInterest);

            // Add yearly interest
            const supplyYearlyInterest = document.createElement('p');
            supplyYearlyInterest.className = 'asset__value';
            supplyYearlyInterest.innerHTML = `<strong>Yearly Interest:</strong> $${this._commafy(parseInt(tokenArray[i].supply_balance_underlying.value * tokenData.cToken[0].supply_rate.value).toFixed(2))}`;
            assetSupplyValues.appendChild(supplyYearlyInterest);

            // Create asset borrow value container
            const assetBorrowValues = document.createElement('div');
            assetBorrowValues.className = 'asset__values asset__values--borrow';
            asset.appendChild(assetBorrowValues);

            // Add interest rate
            const borrowInterestRate = document.createElement('p');
            borrowInterestRate.className = 'asset__value';
            borrowInterestRate.innerHTML = `<strong>Interest Rate:</strong> ${(tokenData.cToken[0].borrow_rate.value * 100).toFixed(2)}% APR`;
            assetBorrowValues.appendChild(borrowInterestRate);

            // Add balance
            const borrowBalance = document.createElement('p');
            borrowBalance.className = 'asset__value';
            borrowBalance.innerHTML = `<strong>Balance:</strong> $${this._commafy(parseInt(tokenArray[i].borrow_balance_underlying.value).toFixed(2))}`;
            assetBorrowValues.appendChild(borrowBalance);

            // Add earned interest
            const owedInterest = document.createElement('p');
            owedInterest.className = 'asset__value';
            owedInterest.innerHTML = `<strong>Interest Owed:</strong> $${this._commafy(parseInt(tokenArray[i].lifetime_borrow_interest_accrued.value).toFixed(2))}`;
            assetBorrowValues.appendChild(owedInterest);

            // Add yearly interest
            const borrowYearlyInterest = document.createElement('p');
            borrowYearlyInterest.className = 'asset__value';
            borrowYearlyInterest.innerHTML = `<strong>Yearly Interest:</strong> $${this._commafy(parseInt(tokenArray[i].borrow_balance_underlying.value * tokenData.cToken[0].supply_rate.value).toFixed(2))}`;
            assetBorrowValues.appendChild(borrowYearlyInterest);

            this._switchTabOnClick(supply, borrow);
          });
        }
      });
    });
  }
}

const form = new Form();
form.onSubmit();