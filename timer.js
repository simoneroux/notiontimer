// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration - Your actual Firebase project
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

// Timer state
let totalSeconds = 25 * 60; // 25 minutes in seconds
let remainingSeconds = totalSeconds;
let isRunning = false;
let timerInterval = null;
let lastSyncTime = Date.now();

// Firebase state
let db = null;
let syncRef = null;
let isOnline = false;
let userId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    initializeFirebase();
    setupEventListeners();
    generateWheelNumbers();
    updateDisplay();
});

// UI Initialization
function initializeUI() {
    updateTimeDisplay();
    updateWheelProgress();
}

// Generate wheel numbers (1-25 for minutes)
function generateWheelNumbers() {
    const wheelNumbers = document.getElementById('wheelNumbers');
    const radius = 175; // Half of wheel size
    const centerX = 175;
    const centerY = 175;

    for (let i = 1; i <= 25; i++) {
        const angle = (i * (360 / 25)) - 90; // Start from top
        const radian = angle * (Math.PI / 180);
        const x = centerX + radius * Math.cos(radian);
        const y = centerY + radius * Math.sin(radian);

        const numberDiv = document.createElement('div');
        numberDiv.className = 'number';
        numberDiv.textContent = i;
        numberDiv.style.left = `${x}px`;
        numberDiv.style.top = `${y}px`;
        numberDiv.style.transform = 'translate(-50%, -50%)';

        wheelNumbers.appendChild(numberDiv);
    }
}

// Firebase initialization
async function initializeFirebase() {
    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        db = getDatabase(app);

        // Get or create user ID
        userId = localStorage.getItem('userId') || generateUserId();
        localStorage.setItem('userId', userId);

        console.log('Connected with User ID:', userId);

        // Set up database reference
        syncRef = ref(db, `timers/${userId}`);

        // Listen for remote changes
        onValue(syncRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.lastUpdate > lastSyncTime) {
                console.log('Received remote update:', data);
                applyRemoteState(data);
            }
        });

        // Load initial state
        const snapshot = await get(syncRef);
        const data = snapshot.val();
        if (data) {
            console.log('Loaded initial state:', data);
            applyRemoteState(data);
        } else {
            console.log('No previous state found, starting fresh');
            // Save initial state
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

    // Load from localStorage
    const saved = localStorage.getItem('timerState');
    if (saved) {
        const state = JSON.parse(saved);
        remainingSeconds = state.remainingSeconds || totalSeconds;
        isRunning = false; // Never auto-start
        updateDisplay();
    }

    // Save periodically
    setInterval(() => {
        saveToLocalStorage();
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

    if (data.isRunning) {
        // Calculate current time based on elapsed time
        remainingSeconds = Math.max(0, data.remainingSeconds - timeSinceUpdate);
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
        remainingSeconds = data.remainingSeconds;
        isRunning = false;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
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
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    document.getElementById('timeDisplay').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateWheelProgress() {
    const progress = remainingSeconds / totalSeconds;
    const circumference = 282.7; // 2 * PI * radius (45)
    const offset = circumference * (1 - progress);

    const progressCircle = document.getElementById('progressCircle');
    progressCircle.style.strokeDashoffset = offset;

    // Update handle position
    const angle = progress * 360 - 90; // Start from top
    const handle = document.getElementById('wheelHandle');
    handle.style.transform = `rotate(${angle}deg) translateX(145px)`;
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

// Sound effect (simple beep)
function playCompletionSound() {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
}

// Event listeners
function setupEventListeners() {
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
    document.getElementById('backBtn').addEventListener('click', resetTimer);
    document.getElementById('settingsBtn').addEventListener('click', () => {
        const userId = localStorage.getItem('userId');
        alert(`Settings\n\nYour User ID:\n${userId}\n\nTo sync this timer on another device:\n1. Open browser console (F12)\n2. Run: localStorage.setItem('userId', '${userId}')\n3. Reload the page`);
    });
    document.getElementById('harpBtn').addEventListener('click', () => {
        playCompletionSound();
    });
    document.getElementById('appearanceBtn').addEventListener('click', () => {
        alert('Appearance settings coming soon!');
    });

    // Handle page visibility
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden && isOnline && syncRef) {
            // Refresh state when page becomes visible
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

    // Handle window unload - save state
    window.addEventListener('beforeunload', () => {
        if (isOnline) {
            // Use navigator.sendBeacon for reliable last-minute sync
            const state = {
                remainingSeconds: remainingSeconds,
                isRunning: isRunning,
                lastUpdate: Date.now()
            };
            saveToLocalStorage();
        }
    });
}
