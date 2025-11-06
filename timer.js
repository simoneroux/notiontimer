// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRSQ5gV7JHoO921SytpbIBtZk2CKkimH0",
    authDomain: "notiontimer-d1b19.firebaseapp.com",
    databaseURL: "https://notiontimer-d1b19-default-rtdb.firebaseio.com",
    projectId: "notiontimer-d1b19",
    storageBucket: "notiontimer-d1b19.firebasestorage.app",
    messagingSenderId: "510895847293",
    appId: "1:510895847293:web:211a2469cc75848d2cfe14",
    measurementId: "G-J3PTJ8Q902"
};

// Sound definitions
const SOUNDS = [
    { id: 'bell', name: 'Bell', icon: '🔔' },
    { id: 'chime', name: 'Chime', icon: '🎐' },
    { id: 'digital', name: 'Digital', icon: '📟' },
    { id: 'gentle', name: 'Gentle', icon: '🌸' },
    { id: 'nature', name: 'Nature', icon: '🌿' },
    { id: 'alert', name: 'Alert', icon: '⚡' }
];

// Timer state
let selectedPresetMinutes = 25; // Default 25 minutes
let totalSeconds = selectedPresetMinutes * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;
let timerInterval = null;
let lastSyncTime = Date.now();
let selectedSound = 'bell';

// Firebase state
let db = null;
let syncRef = null;
let isOnline = false;
let userId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserPreferences();
    initializeFirebase(); // Initialize Firebase first to get userId
    initializeUI();
    setupEventListeners();
    renderSoundOptions();
    updateDisplay();
});

// Load user preferences from localStorage
function loadUserPreferences() {
    const savedSound = localStorage.getItem('selectedSound');
    if (savedSound) {
        selectedSound = savedSound;
    }

    const savedPreset = localStorage.getItem('selectedPreset');
    if (savedPreset) {
        selectedPresetMinutes = parseInt(savedPreset);
        totalSeconds = selectedPresetMinutes * 60;
        remainingSeconds = totalSeconds;

        // Set the dropdown value after DOM is loaded
        setTimeout(() => {
            const select = document.getElementById('timerSelect');
            if (select) {
                select.value = savedPreset;
            }
        }, 0);
    }
}

// Save user preferences
function saveUserPreferences() {
    localStorage.setItem('selectedSound', selectedSound);
    localStorage.setItem('selectedPreset', selectedPresetMinutes.toString());
}

// Render sound options in settings
function renderSoundOptions() {
    const soundOptions = document.getElementById('soundOptions');
    soundOptions.innerHTML = '';

    SOUNDS.forEach(sound => {
        const option = document.createElement('div');
        option.className = 'sound-option';
        if (sound.id === selectedSound) {
            option.classList.add('selected');
        }

        option.innerHTML = `
            <div class="sound-icon">${sound.icon}</div>
            <div class="sound-name">${sound.name}</div>
        `;

        option.addEventListener('click', () => {
            selectedSound = sound.id;
            saveUserPreferences();
            renderSoundOptions();
            playCompletionSound(); // Test the sound
        });

        soundOptions.appendChild(option);
    });
}

// UI Initialization
function initializeUI() {
    updateTimeDisplay();
    generateWheelTicks();
    generateWheelNumbers();
    updateWheelProgress();

    // Display user ID in settings (already set by initializeFirebase)
    document.getElementById('userIdDisplay').textContent = userId;
    document.getElementById('userIdInput').value = userId;
}

// Generate wheel ticks (always 60)
function generateWheelTicks() {
    const wheelTicks = document.getElementById('wheelTicks');
    wheelTicks.innerHTML = '';
    const radius = 175; // Half of wheel size (350px)
    const centerX = 175;
    const centerY = 175;

    for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * 360;
        const radian = angle * (Math.PI / 180);
        // Calculate position on the circle edge
        const x = centerX + radius * Math.cos(radian);
        const y = centerY + radius * Math.sin(radian);

        const tick = document.createElement('div');
        tick.className = 'tick';
        if (i % 5 === 0) {
            tick.classList.add('large');
        }
        tick.style.left = `${x}px`;
        tick.style.top = `${y}px`;
        // Rotate tick to point outwards
        tick.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
        wheelTicks.appendChild(tick);
    }
}

// Generate wheel numbers dynamically based on timer duration
function generateWheelNumbers() {
    const wheelNumbers = document.getElementById('wheelNumbers');
    wheelNumbers.innerHTML = '';

    const radius = 150; // Inside the ticks
    const centerX = 175;
    const centerY = 175;

    const maxMinutes = selectedPresetMinutes;

    // Calculate step size for clean display
    let step;
    if (maxMinutes <= 10) {
        step = 1; // Show every minute
    } else if (maxMinutes <= 30) {
        step = 5; // Show every 5 minutes
    } else {
        step = 10; // Show every 10 minutes
    }

    // Generate numbers at intervals
    for (let i = step; i <= maxMinutes; i += step) {
        const angle = ((i / maxMinutes) * 360) - 90; // Start from top
        const radian = angle * (Math.PI / 180);
        const x = centerX + radius * Math.cos(radian);
        const y = centerY + radius * Math.sin(radian);

        const numberDiv = document.createElement('div');
        numberDiv.className = 'number';
        let displayText = Math.round(i);
        if (i === maxMinutes) {
            displayText = `${Math.round(i)}'`; // Add ' mark to max
        }
        numberDiv.textContent = displayText;
        numberDiv.style.left = `${x}px`;
        numberDiv.style.top = `${y}px`;

        wheelNumbers.appendChild(numberDiv);
    }
}

// Firebase initialization
async function initializeFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getDatabase(app);

        userId = localStorage.getItem('userId') || generateUserId();
        localStorage.setItem('userId', userId);

        console.log('Connected with User ID:', userId);

        syncRef = ref(db, `timers/${userId}`);

        onValue(syncRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.lastUpdate > lastSyncTime) {
                console.log('Received remote update:', data);
                applyRemoteState(data);
            }
        });

        const snapshot = await get(syncRef);
        const data = snapshot.val();
        if (data) {
            console.log('Loaded initial state:', data);
            applyRemoteState(data);
        } else {
            console.log('No previous state found, starting fresh');
            await syncToFirebase();
        }

        isOnline = true;
        updateSyncStatus('synced');
        console.log('Firebase initialized successfully');

    } catch (error) {
        console.error('Firebase initialization error:', error);
        useLocalStorage();
    }
}

// Fallback to localStorage
function useLocalStorage() {
    isOnline = false;
    updateSyncStatus('offline');
    console.log('Using localStorage fallback');

    const saved = localStorage.getItem('timerState');
    if (saved) {
        const state = JSON.parse(saved);
        remainingSeconds = state.remainingSeconds || totalSeconds;
        if (state.totalSeconds) {
            totalSeconds = state.totalSeconds;
            selectedPresetMinutes = Math.round(totalSeconds / 60);
        }
        isRunning = false;

        // Update dropdown to match loaded state
        const select = document.getElementById('timerSelect');
        if (select) {
            select.value = selectedPresetMinutes.toString();
        }

        generateWheelNumbers();
        updateDisplay();
    }

    setInterval(() => {
        if (isRunning) saveToLocalStorage();
    }, 1000);
}

// Generate unique user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Apply remote state
function applyRemoteState(data) {
    const now = Date.now();
    const timeSinceUpdate = (now - data.lastUpdate) / 1000;

    // Update total seconds if changed
    if (data.totalSeconds && data.totalSeconds !== totalSeconds) {
        totalSeconds = data.totalSeconds;
        selectedPresetMinutes = Math.round(totalSeconds / 60);

        // Update dropdown to match synced state
        const select = document.getElementById('timerSelect');
        if (select) {
            select.value = selectedPresetMinutes.toString();
        }

        generateWheelNumbers();
    }

    if (data.isRunning) {
        // FIX: Round remainingSeconds to avoid decimals
        remainingSeconds = Math.round(Math.max(0, data.remainingSeconds - timeSinceUpdate));
        if (remainingSeconds > 0) {
            isRunning = true;
            startTimer();
        } else {
            remainingSeconds = 0;
            isRunning = false;
            pauseTimer();
            playCompletionSound();
        }
    } else {
        // FIX: Round remainingSeconds to avoid decimals
        remainingSeconds = Math.round(data.remainingSeconds);
        isRunning = false;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        updatePlayPauseButton();
    }

    lastSyncTime = now;
    updateDisplay();
}

// Sync to Firebase
async function syncToFirebase() {
    if (!isOnline || !syncRef) return;

    try {
        updateSyncStatus('syncing');
        const state = {
            remainingSeconds: remainingSeconds,
            totalSeconds: totalSeconds,
            isRunning: isRunning,
            lastUpdate: Date.now()
        };

        await set(syncRef, state);
        lastSyncTime = Date.now();
        updateSyncStatus('synced');
        console.log('Synced to Firebase:', state);
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('offline');
    }
}

// Save to localStorage
function saveToLocalStorage() {
    const state = {
        remainingSeconds: remainingSeconds,
        totalSeconds: totalSeconds,
        isRunning: isRunning,
        lastUpdate: Date.now()
    };
    localStorage.setItem('timerState', JSON.stringify(state));
}

// Update sync status indicator
function updateSyncStatus(status) {
    const syncDot = document.getElementById('syncDot');
    const syncStatus = document.getElementById('syncStatus');

    syncDot.className = 'sync-dot';

    switch (status) {
        case 'synced':
            syncDot.classList.add('synced');
            syncStatus.textContent = 'Synced';
            break;
        case 'syncing':
            syncDot.classList.add('syncing');
            syncStatus.textContent = 'Syncing...';
            break;
        case 'offline':
            syncDot.classList.add('offline');
            syncStatus.textContent = 'Offline';
            break;
    }
}

// Timer functions
function startTimer() {
    if (timerInterval) return;

    isRunning = true;
    updatePlayPauseButton();

    timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();

            // Sync every 5 seconds while running
            if (remainingSeconds % 5 === 0) {
                if (isOnline) {
                    syncToFirebase();
                } else {
                    saveToLocalStorage();
                }
            }
        } else {
            pauseTimer();
            playCompletionSound();
            showNotification('Timer Complete!', 'Your session is finished.');
        }
    }, 1000);

    if (isOnline) {
        syncToFirebase();
    } else {
        saveToLocalStorage();
    }
}

function pauseTimer() {
    isRunning = false;
    updatePlayPauseButton();

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (isOnline) {
        syncToFirebase();
    } else {
        saveToLocalStorage();
    }
}

function resetTimer() {
    remainingSeconds = totalSeconds;
    pauseTimer();
    updateDisplay();

    if (isOnline) {
        syncToFirebase();
    } else {
        saveToLocalStorage();
    }
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// Update display
function updateDisplay() {
    updateTimeDisplay();
    updateWheelProgress();
}

function updateTimeDisplay() {
    // FIX: Round remainingSeconds before calculation to ensure no decimals
    const totalSec = Math.round(remainingSeconds);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;

    document.getElementById('timeDisplay').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateWheelProgress() {
    // Calculate progress (0 to 1)
    const progress = remainingSeconds / totalSeconds;
    // Calculate angle (0 to 360)
    const angle = progress * 360;

    // Update pointer rotation
    const pointer = document.getElementById('wheelPointer');
    pointer.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

function updatePlayPauseButton() {
    const btn = document.getElementById('playPauseBtn');
    const icon = btn.querySelector('span');

    if (isRunning) {
        icon.className = 'pause-icon';
    } else {
        icon.className = 'play-icon';
    }
}

// Sound generation
function playCompletionSound() {
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
        console.log('Audio not supported');
        return;
    }
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        switch (selectedSound) {
            case 'bell': playBellSound(audioContext); break;
            case 'chime': playChimeSound(audioContext); break;
            case 'digital': playDigitalSound(audioContext); break;
            case 'gentle': playGentleSound(audioContext); break;
            case 'nature': playNatureSound(audioContext); break;
            case 'alert': playAlertSound(audioContext); break;
            default: playBellSound(audioContext);
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function playBellSound(audioContext) {
    const frequencies = [800, 1000, 1200];
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        const startTime = audioContext.currentTime + (index * 0.15);
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.8);
    });
}

function playChimeSound(audioContext) {
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'triangle';
        const startTime = audioContext.currentTime + (index * 0.2);
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
        oscillator.start(startTime);
        oscillator.stop(startTime + 1.5);
    });
}

function playDigitalSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 1000;
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    oscillator2.frequency.value = 1000;
    oscillator2.type = 'square';
    gainNode2.gain.setValueAtTime(0.15, audioContext.currentTime + 0.35);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.65);
    oscillator2.start(audioContext.currentTime + 0.35);
    oscillator2.stop(audioContext.currentTime + 0.65);
}

function playGentleSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 440; // A4
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
}

function playNatureSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1800, audioContext.currentTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(1400, audioContext.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(1400, audioContext.currentTime + 0.4);
    oscillator2.frequency.linearRampToValueAtTime(2000, audioContext.currentTime + 0.5);
    oscillator2.frequency.linearRampToValueAtTime(1600, audioContext.currentTime + 0.6);
    gainNode2.gain.setValueAtTime(0.15, audioContext.currentTime + 0.4);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
    oscillator2.start(audioContext.currentTime + 0.4);
    oscillator2.stop(audioContext.currentTime + 0.7);
}

function playAlertSound(audioContext) {
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        oscillator.type = 'sawtooth';
        const startTime = audioContext.currentTime + (i * 0.25);
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
    }
}


// Browser notification
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body });
            }
        });
    }
}

// Event listeners
function setupEventListeners() {
    // Timer duration dropdown
    document.getElementById('timerSelect').addEventListener('change', (e) => {
        if (isRunning) {
            if (!confirm('Stop current timer and switch duration?')) {
                e.target.value = selectedPresetMinutes.toString();
                return;
            }
            pauseTimer();
        }

        selectedPresetMinutes = parseInt(e.target.value);
        totalSeconds = selectedPresetMinutes * 60;
        remainingSeconds = totalSeconds;

        saveUserPreferences();
        generateWheelNumbers(); // Regenerate numbers for new duration
        updateDisplay();

        if (isOnline) syncToFirebase();
        else saveToLocalStorage();
    });

    // Timer controls
    document.getElementById('playPauseBtn').addEventListener('click', toggleTimer);

    document.getElementById('prevBtn').addEventListener('click', () => {
        remainingSeconds = Math.min(totalSeconds, remainingSeconds + 60);
        updateDisplay();
        if (isOnline) syncToFirebase();
        else saveToLocalStorage();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        remainingSeconds = Math.max(0, remainingSeconds - 60);
        updateDisplay();
        if (isOnline) syncToFirebase();
        else saveToLocalStorage();
    });

    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.getElementById('closeModal');

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        // Request notification permission when settings open
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    });

    closeModal.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    // --- New Sync ID Listeners ---
    document.getElementById('syncIdBtn').addEventListener('click', () => {
        const newId = document.getElementById('userIdInput').value.trim();
        if (newId && newId !== userId) {
            if (confirm(`Sync to new ID: "${newId}"? This will load the timer state from that ID.`)) {
                userId = newId;
                localStorage.setItem('userId', userId);
                alert('ID updated. Reloading to sync...');
                window.location.reload();
            }
        } else if (!newId) {
            alert('Please enter a valid ID.');
        }
    });

    document.getElementById('copyIdBtn').addEventListener('click', () => {
        const currentId = document.getElementById('userIdDisplay').textContent;
        navigator.clipboard.writeText(currentId).then(() => {
            const btn = document.getElementById('copyIdBtn');
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = 'Copy Current ID';
            }, 2000);
        });
    });

    // Test sound button
    document.getElementById('testSoundBtn').addEventListener('click', () => {
        playCompletionSound();
    });

    // Handle page visibility
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden && isOnline && syncRef) {
            try {
                const snapshot = await get(syncRef);
                const data = snapshot.val();
                if (data) {
                    applyRemoteState(data);
                }
            } catch (error) {
                console.error('Error refreshing state:', error);
            }
        }
    });

    // Handle window unload
    window.addEventListener('beforeunload', () => {
        if (isOnline) {
            saveToLocalStorage();
        }
    });
}
