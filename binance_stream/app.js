// app.js
const coinDropdown = document.getElementById('coinDropdown');
const timeframeSelect = document.getElementById('timeframeSelect');
const ctx = document.getElementById('candlestickChart').getContext('2d');

let chartInstance;
const historicalData = {
    ethusdt: [],
    bnbusdt: [],
    dotusdt: []
};

const updateChart = (coinData) => {
    if (chartInstance) {
        chartInstance.destroy();  // Destroy the existing chart
    }

    const candlestickData = coinData.map(data => ({
        x: moment(data.timestamp),  // Use moment.js to handle timestamps
        o: data.open,
        h: data.high,
        l: data.low,
        c: data.close
    }));

    chartInstance = new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'Candlestick Chart',
                data: candlestickData,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'MMM D, h:mm a'  // Format for the x-axis labels
                        }
                    }
                }
            }
        }
    });
};

const fetchCandlestickData = (coin) => {
    // Fetch historical data from local storage
    const storedData = localStorage.getItem(coin);
    if (storedData) {
        historicalData[coin] = JSON.parse(storedData);
        updateChart(historicalData[coin]);
    }

    // Connect to WebSocket for live updates
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/<symbol>@kline_<interval>`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const timestamp = Date.now(); // Current timestamp
        const newTrade = {
            timestamp: timestamp,
            open: parseFloat(data.p),
            high: parseFloat(data.p),
            low: parseFloat(data.p),
            close: parseFloat(data.p)
        };

        // Update historical data for the current coin
        historicalData[coin].push(newTrade);

        // Persist to local storage
        localStorage.setItem(coin, JSON.stringify(historicalData[coin]));

        // Update the chart
        updateChart(historicalData[coin]);
    };
};

const handleCoinSelection = (event) => {
    const selectedCoin = event.target.getAttribute('data-coin');
    fetchCandlestickData(selectedCoin);
};

const handleTimeframeChange = () => {
    // Logic for timeframe change could be added here
};

coinDropdown.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        handleCoinSelection(event);
    }
});

timeframeSelect.addEventListener('change', handleTimeframeChange);
