// const address = '0x8d093c8c70b5b5ba375d2d301c52d5b9d5ec79e3';

const addressForm = document.querySelector('.addressForm');
const addressInput = document.querySelector('.addressInput');
const result = document.querySelector('.result');

addressForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const address = addressInput.value;

  const xhr = new XMLHttpRequest();
  const url = `https://api.compound.finance/api/v2/account?addresses[]=${address}`;

  xhr.open('GET', url);
  xhr.send();

  xhr.onreadystatechange = (e) => {
    result.innerHTML = xhr.responseText
  }
});
