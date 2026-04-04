// Global Variables for Chatbot Integration
let weatherData = null;
let currencyData = null;
let citizenData = null;
let factData = null;

// Initialization
document.querySelectorAll('.card-body').forEach(el => {
    el.style.transition = 'opacity 0.2s ease-in-out';
});

// Auto-fetch all data on page load
fetchAllData();

async function fetchAllData() {
    await Promise.all([
        fetchWeather(),
        fetchCurrency(),
        fetchCitizen(),
        fetchFact()
    ]);
}

async function refreshData(event, cardType) {
    // Get the button to add spinning animation
    const btn = event.currentTarget;
    btn.classList.add('spinning');
    
    const container = document.getElementById(`${cardType}-data`);
    
    // Fade out
    container.style.opacity = '0';

    try {
        if (cardType === 'weather') await fetchWeather();
        else if (cardType === 'currency') await fetchCurrency();
        else if (cardType === 'citizen') await fetchCitizen();
        else if (cardType === 'fact') await fetchFact();
    } catch(error) {
        console.error("Error refreshing data:", error);
    } finally {
        // Fade back in
        container.style.opacity = '1';
        btn.classList.remove('spinning');
    }
}

async function fetchWeather() {
    const container = document.getElementById('weather-data');
    try {
        const response = await fetch('https://wttr.in/Pune?format=j1');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        
        weatherData = {
            temperature: data.current_condition[0].temp_C,
            windspeed: data.current_condition[0].windspeedKmph
        };

        container.innerHTML = `
            <div class="data-primary">${weatherData.temperature}°C</div>
            <div class="data-secondary">Wind: ${weatherData.windspeed} km/h</div>
        `;
    } catch (error) {
        console.warn("Weather API failed, using fallback.", error);
        weatherData = { temperature: 24, windspeed: 12 };
        container.innerHTML = `
            <div class="data-primary">${weatherData.temperature}°C</div>
            <div class="data-secondary">Wind: ${weatherData.windspeed} km/h (Offline mode)</div>
        `;
    }
}

async function fetchCurrency() {
    const container = document.getElementById('currency-data');
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        
        const inr = data.rates.INR;
        const usdInInr = 1 / inr;
        const eurInInr = data.rates.EUR / inr;
        const gbpInInr = data.rates.GBP / inr;

        currencyData = {
            USD: usdInInr.toFixed(4),
            EUR: eurInInr.toFixed(4),
            GBP: gbpInInr.toFixed(4)
        };

        container.innerHTML = `
            <div class="data-primary" style="font-size: 1.5rem;">1 INR = ${currencyData.USD} USD</div>
            <div class="data-secondary">EUR: ${currencyData.EUR} | GBP: ${currencyData.GBP}</div>
        `;
    } catch (error) {
        console.warn("Currency API failed, using fallback.", error);
        currencyData = { USD: "0.0120", EUR: "0.0111", GBP: "0.0095" };
        container.innerHTML = `
            <div class="data-primary" style="font-size: 1.5rem;">1 INR = ${currencyData.USD} USD</div>
            <div class="data-secondary">EUR: ${currencyData.EUR} | GBP: ${currencyData.GBP} (Offline mode)</div>
        `;
    }
}

async function fetchCitizen() {
    const container = document.getElementById('citizen-data');
    try {
        const response = await fetch('https://randomuser.me/api/');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        const user = data.results[0];

        citizenData = {
            fullName: `${user.name.first} ${user.name.last}`,
            email: user.email,
            city: user.location.city,
            profileImage: user.picture.medium
        };

        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                <img src="${citizenData.profileImage}" alt="Profile" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--accent);">
                <div class="data-primary" style="font-size: 1.5rem; margin-bottom: 0;">${citizenData.fullName}</div>
            </div>
            <div class="data-secondary">${citizenData.email}</div>
            <div class="data-secondary">${citizenData.city}</div>
        `;
    } catch (error) {
        console.warn("Citizen API failed, using fallback.", error);
        citizenData = { fullName: "John Doe", email: "john@example.com", city: "Metropolis", profileImage: "https://randomuser.me/api/portraits/lego/1.jpg" };
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                <img src="${citizenData.profileImage}" alt="Profile" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--accent);">
                <div class="data-primary" style="font-size: 1.5rem; margin-bottom: 0;">${citizenData.fullName}</div>
            </div>
            <div class="data-secondary">${citizenData.email}</div>
            <div class="data-secondary">${citizenData.city} (Offline mode)</div>
        `;
    }
}

async function fetchFact() {
    const container = document.getElementById('fact-data');
    try {
        const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();

        factData = {
            text: data.text
        };

        container.innerHTML = `
            <div class="data-secondary fact-text">${factData.text}</div>
        `;
    } catch (error) {
        console.warn("Fact API failed, using fallback.", error);
        factData = { text: "Smart cities use IoT devices to optimize city functions." };
        container.innerHTML = `
            <div class="data-secondary fact-text">${factData.text} (Offline mode)</div>
        `;
    }
}

// Function to build context from global variables
function buildContext() {
    let context = "You are a helpful SmartCity assistant.\n\nAnswer ONLY based on this live dashboard data:\n\n";

    if (weatherData) {
        context += `WEATHER:\nTemperature: ${weatherData.temperature}°C\nWind Speed: ${weatherData.windspeed} km/h\n\n`;
    }

    if (currencyData) {
        context += `CURRENCY:\n1 INR = ${currencyData.USD} USD\n1 INR = ${currencyData.EUR} EUR\n1 INR = ${currencyData.GBP} GBP\n\n`;
    }

    if (citizenData) {
        // Map fullName from citizenData to Name
        context += `CITIZEN:\nName: ${citizenData.fullName}\nCity: ${citizenData.city}\nEmail: ${citizenData.email}\n\n`;
    }

    if (factData) {
        context += `CITY FACT:\n${factData.text}\n\n`;
    }

    context += 'If the user asks anything unrelated, respond:\n"I only have information about the dashboard data."';

    return context;
}

// Chatbot functionality
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.toggle('closed');
    
    if (!chatWindow.classList.contains('closed')) {
        document.getElementById('chat-input').focus();
    }
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const messageText = input.value.trim();
    
    if (messageText === '') return;

    // Add user message
    addMessageToChat(messageText, 'user-message');
    input.value = '';

    // Scroll to bottom
    scrollToBottom();

    // Show "Thinking..." loading state
    const loadingId = addLoadingMessage();
    scrollToBottom();

    // Build context
    const context = buildContext();

    const apiKey = "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";
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'YOUR_OPENROUTER_KEY') {
        removeLoadingMessage(loadingId);
        addMessageToChat("API key not configured", 'bot-message');
        scrollToBottom();
        return;
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: context },
                    { role: "user", content: messageText }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API Error');
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;

        removeLoadingMessage(loadingId);
        addMessageToChat(aiMessage, 'bot-message');
    } catch (error) {
        console.error("Chatbot Error:", error);
        removeLoadingMessage(loadingId);
        addMessageToChat("Chatbot failed to respond", 'bot-message');
    }

    scrollToBottom();
}

function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'message bot-message';
    messageEl.id = id;
    messageEl.textContent = 'Thinking...';
    messagesContainer.appendChild(messageEl);
    return id;
}

function removeLoadingMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function addMessageToChat(text, className) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${className}`;
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
