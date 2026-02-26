class WorkoutTimerWeb {
    constructor() {
        this.actionTime = 30;
        this.restTime = 15;
        this.totalTime = 300;
        this.soundType = 'beep';
        this.keepScreenAwake = true;
        this.darkMode = false;
        
        this.timeElapsed = 0;
        this.cyclesCompleted = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.timerInterval = null;
        this.wakeLock = null;
        
        // single shared AudioContext (resume on user gesture)
        this.audioContext = null;
        this.resumeAudioContext = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        };
        this.soundFiles = null; // unused now
        
        this.initializeEventListeners();
        this.loadThemePreference();
    }
    
    initializeEventListeners() {
        // Setup section
        document.getElementById('startBtn').addEventListener('click', () => this.startWorkout());
        
        // Workout section
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopWorkout());
        
        // Keep screen awake toggle
        document.getElementById('keepScreenAwake').addEventListener('change', (e) => {
            this.keepScreenAwake = e.target.checked;
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('change', (e) => {
            this.setDarkMode(e.target.checked);
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            // Use currentTarget so clicking on the inner text still references the button element
            btn.addEventListener('click', (e) => this.loadPreset(e.currentTarget));
            console.log('attached preset listener to', btn);
        });
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => this.resetToSetup());
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    playSound(count = 1) {
        // Use Web Audio API to generate beep sounds
        if (this.soundType === 'silent') return;
        
        // lazily create audio context on first sound request
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // ensure context is resumed (user gesture should have triggered startWorkout)
        this.resumeAudioContext();
        
        const frequency = this.getSoundFrequency();
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.generateBeep(this.audioContext, frequency);
            }, i * 200);
        }
    }
    
    getSoundFrequency() {
        const frequencies = {
            beep: 1000,
            glass: 2000,
            ping: 1500,
            submarine: 400
        };
        return frequencies[this.soundType] || 1000;
    }
    
    generateBeep(audioContext, frequency) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = this.soundType === 'submarine' ? 'sine' : 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    startWorkout() {
        this.actionTime = parseInt(document.getElementById('actionTime').value);
        this.restTime = parseInt(document.getElementById('restTime').value);
        this.totalTime = parseInt(document.getElementById('totalTime').value);
        this.soundType = document.getElementById('soundSelect').value;
        this.keepScreenAwake = document.getElementById('keepScreenAwake').checked;
        
        // Validate
        if (this.totalTime < (this.actionTime + this.restTime)) {
            alert('Total time must be at least action + rest time');
            return;
        }
        
        // Reset counters
        this.timeElapsed = 0;
        this.cyclesCompleted = 0;
        this.isRunning = true;
        this.isPaused = false;
        
        // resume audio context on user interaction
        this.resumeAudioContext();
        
        // Request wake lock if enabled
        if (this.keepScreenAwake) {
            this.requestWakeLock();
        }
        
        // Show workout section
        this.showSection('workoutSection');
        
        // Start the timer
        this.runWorkout();
    }
    
    runWorkout() {
        if (!this.isRunning) return;
        
        const startTime = Date.now();
        let phaseStartTime = startTime;
        let isActionPhase = true;
        
        const updateTimer = () => {
            if (!this.isRunning) return;
            
            if (this.isPaused) {
                setTimeout(updateTimer, 100);
                return;
            }
            
            const now = Date.now();
            this.timeElapsed = Math.floor((now - startTime) / 1000);
            const remainingTotal = Math.max(0, this.totalTime - this.timeElapsed);
            
            const currentPhaseDuration = isActionPhase ? this.actionTime : this.restTime;
            const phaseElapsed = Math.floor((now - phaseStartTime) / 1000);
            const remainingPhase = Math.max(0, currentPhaseDuration - phaseElapsed);
            
            // Update display
            document.getElementById('totalDisplay').textContent = this.formatTime(remainingTotal);
            document.getElementById('phaseDisplay').textContent = this.formatTime(remainingPhase);
            document.getElementById('cyclesCompleted').textContent = this.cyclesCompleted;
            
            const phaseText = isActionPhase ? '🏃 ACTION' : '😴 REST';
            document.getElementById('phaseLabel').textContent = phaseText;
            document.getElementById('currentPhaseText').textContent = phaseText;
            
            // Check if total time expired
            if (remainingTotal <= 0) {
                this.completeWorkout();
                return;
            }
            
            // Check if phase complete
            if (remainingPhase <= 0) {
                this.playSound(2); // 2 beeps for phase transition
                
                if (isActionPhase) {
                    // Switch to rest
                    isActionPhase = false;
                } else {
                    // Complete cycle
                    isActionPhase = true;
                    this.cyclesCompleted++;
                }
                
                phaseStartTime = Date.now();
            }
            
            setTimeout(updateTimer, 100);
        };
        
        this.playSound(1); // 1 beep to start
        updateTimer();
    }
    
    togglePause() {
        const btn = document.getElementById('pauseBtn');
        if (this.isPaused) {
            this.isPaused = false;
            btn.textContent = 'Pause';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-warning');
        } else {
            this.isPaused = true;
            btn.textContent = 'Resume';
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-success');
        }
    }
    
    stopWorkout() {
        if (confirm('Are you sure you want to stop the workout?')) {
            this.isRunning = false;
            this.releaseWakeLock();
            this.resetToSetup();
        }
    }
    
    completeWorkout() {
        this.isRunning = false;
        this.playSound(3); // 3 beeps for completion
        this.releaseWakeLock();
        
        document.getElementById('finalTotalTime').textContent = this.formatTime(this.totalTime);
        document.getElementById('finalCycles').textContent = this.cyclesCompleted;
        
        this.showSection('completeSection');
    }
    
    loadPreset(button) {
        console.log('preset button clicked', button.dataset);
        const action = parseInt(button.dataset.action);
        const rest = parseInt(button.dataset.rest);
        const total = parseInt(button.dataset.total);
        
        document.getElementById('actionTime').value = action;
        document.getElementById('restTime').value = rest;
        document.getElementById('totalTime').value = total;
        
        // resume audio context and start workout using this preset
        this.resumeAudioContext();
        document.getElementById('soundSelect').value = this.soundType || 'beep';
        this.startWorkout();
    }
    
    resetToSetup() {
        this.isRunning = false;
        this.isPaused = false;
        this.releaseWakeLock();
        document.getElementById('pauseBtn').textContent = 'Pause';
        document.getElementById('pauseBtn').classList.remove('btn-success');
        document.getElementById('pauseBtn').classList.add('btn-warning');
        this.showSection('setupSection');
    }
    
    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                
                // Handle wake lock being released
                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake lock was released');
                });
            }
        } catch (err) {
            console.error(`Wake lock request failed: ${err.name}, ${err.message}`);
        }
    }
    
    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release().then(() => {
                this.wakeLock = null;
            }).catch(err => {
                console.error(`Error releasing wake lock: ${err.name}, ${err.message}`);
            });
        }
    }
    
    // Theme helpers
    setDarkMode(enabled) {
        this.darkMode = enabled;
        document.body.classList.toggle('dark', enabled);
        document.getElementById('themeToggle').checked = enabled;
        localStorage.setItem('darkMode', enabled ? '1' : '0');
    }

    loadThemePreference() {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            this.setDarkMode(saved === '1');
        } else {
            // default to system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setDarkMode(prefersDark);
        }
    }
    
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorkoutTimerWeb();
});
