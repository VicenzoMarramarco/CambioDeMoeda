const API_TOKEN = 'sk_8YWIzv8JYv-abe4zI9KqZ7JGe9gtNJYBmQx0xFiYVM-SdDElWwalz0K42MqwG';
const API_URL = 'https://economia.awesomeapi.com.br/json/last';

const form = document.querySelector('#converter-form');
const amountInput = document.querySelector('#amount');
const fromCurrency = document.querySelector('#from-currency');
const toCurrency = document.querySelector('#to-currency');
const resultOutput = document.querySelector('#result');
const pairLabel = document.querySelector('#pair-label');
const lastUpdated = document.querySelector('#last-updated');
const errorMessage = document.querySelector('#error-message');
const swapButton = document.querySelector('#swap-button');

const fromFlag = document.querySelector('#from-flag');
const toFlag = document.querySelector('#to-flag');

const currencyFlags = {
    USD: 'us',
    EUR: 'eu',
    GBP: 'gb',
    BRL: 'br',
    ARS: 'ar',
    AUD: 'au',
    CAD: 'ca',
    CHF: 'ch',
    CNY: 'cn',
    JPY: 'jp',
    MXN: 'mx',
    CLP: 'cl',
    UYU: 'uy',
    PYG: 'py',
    PEN: 'pe',
    COP: 'co'
};

let currentRate = null;

function updateFlags() {
    fromFlag.className = `fi fi-${currencyFlags[fromCurrency.value]}`;
    toFlag.className = `fi fi-${currencyFlags[toCurrency.value]}`;
}

function formatMoney(value, currency) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    resultOutput.textContent = '--';
}


// Esconde mensagem de erro
function hideError() {
    errorMessage.hidden = true;
}

function updateResult() {
    const amount = Number.parseFloat(amountInput.value);

    if (!Number.isFinite(amount) || amount < 0 || currentRate === null) {
        resultOutput.textContent = '--';
        return;
    }

    resultOutput.textContent = formatMoney(
        amount * currentRate,
        toCurrency.value
    );
}

async function fetchRate() {
    const from = fromCurrency.value;
    const to = toCurrency.value;

    pairLabel.textContent = `${from} / ${to}`;

    currentRate = null;
    resultOutput.textContent = '...';

    hideError();

    // Se as duas moedas forem iguais
    if (from === to) {
        currentRate = 1;

        lastUpdated.textContent = 'Paridade entre moedas';

        updateResult();
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/${from}-${to}?token=${encodeURIComponent(API_TOKEN)}`
        );

        if (!response.ok) {
            throw new Error('A API respondeu com erro.');
        }

        const data = await response.json();

        const quote = data[`${from}${to}`];
        const rate = Number.parseFloat(quote?.bid);

        if (!Number.isFinite(rate)) {
            throw new Error('A cotação não foi encontrada.');
        }

        currentRate = rate;

        lastUpdated.textContent =
            `Atualizado às ${new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;

        updateResult();

    } catch (error) {
        showError(
            'Não foi possível carregar a cotação. Tente novamente.'
        );

        lastUpdated.textContent =
            'Falha ao conectar às cotações';

        console.error(error);
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    fetchRate();
});

amountInput.addEventListener('input', updateResult);

fromCurrency.addEventListener('change', () => {
    updateFlags();
    fetchRate();
});

toCurrency.addEventListener('change', () => {
    updateFlags();
    fetchRate();
});

swapButton.addEventListener('click', () => {
    const previousFrom = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = previousFrom;

    updateFlags();
    fetchRate();
});

updateFlags();
fetchRate();