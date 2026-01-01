/**
 * Bible 365 - One Year Bible Reading Plan with Exegesis
 * Main Application JavaScript
 */

(function () {
    'use strict';

    // ============================================
    // State Management
    // ============================================
    const state = {
        currentView: 'dashboard',
        selectedDay: null,
        completedDays: new Set(),
        completedReadings: new Set(), // Format: "day-readingIndex" e.g. "1-0"
        currentFilter: 'all',
        theme: 'light',
        language: 'id' // 'id' for Indonesian (local), 'en' for English (API)
    };

    // ============================================
    // DOM Elements
    // ============================================
    const elements = {
        // Navigation
        navDashboard: document.getElementById('nav-dashboard'),
        navReading: document.getElementById('nav-reading'),
        themeToggle: document.getElementById('theme-toggle'),

        // Language Toggle
        langId: document.getElementById('lang-id'),
        langEn: document.getElementById('lang-en'),

        // Views
        dashboardView: document.getElementById('dashboard-view'),
        readingView: document.getElementById('reading-view'),

        // Dashboard
        calendarGrid: document.getElementById('calendar-grid'),
        progressBar: document.querySelector('.progress-fill'),
        progressPercentage: document.getElementById('progress-percentage'),
        progressInfoText: document.getElementById('progress-info-text'),
        daysCompleted: document.getElementById('days-completed'),
        currentStreak: document.getElementById('current-streak'),
        chaptersRead: document.getElementById('chapters-read'),

        // Filters
        filterAll: document.getElementById('filter-all'),
        filterCompleted: document.getElementById('filter-completed'),
        filterPending: document.getElementById('filter-pending'),

        // Reading View
        backToDashboard: document.getElementById('back-to-dashboard'),
        readingDayTitle: document.getElementById('reading-day-title'),
        readingDate: document.getElementById('reading-date'),
        markCompleteBtn: document.getElementById('mark-complete-btn'),
        readingsList: document.getElementById('readings-list'),

        // Modal
        modalOverlay: document.getElementById('modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        modalContent: document.getElementById('modal-content'),
        modalClose: document.getElementById('modal-close'),

        // Toast
        toastContainer: document.getElementById('toast-container')
    };

    // ============================================
    // LocalStorage Functions
    // ============================================
    function loadProgress() {
        try {
            const saved = localStorage.getItem('bible365_progress');
            if (saved) {
                const data = JSON.parse(saved);
                state.completedDays = new Set(data.completedDays || []);
                state.completedReadings = new Set(data.completedReadings || []);

                // Migration: If we have completed days but no completed readings (legacy data),
                // populate the readings for those days.
                if (state.completedDays.size > 0 && state.completedReadings.size === 0 && window.BibleData) {
                    state.completedDays.forEach(day => {
                        const dayData = window.BibleData.READING_PLAN.find(p => p.day === day);
                        if (dayData) {
                            dayData.readings.forEach((_, idx) => {
                                state.completedReadings.add(`${day}-${idx}`);
                            });
                        }
                    });
                }
            }

            const savedTheme = localStorage.getItem('bible365_theme');
            if (savedTheme) {
                state.theme = savedTheme;
            }

            const savedLanguage = localStorage.getItem('bible365_language');
            if (savedLanguage) {
                state.language = savedLanguage;
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }

    function saveProgress() {
        try {
            const data = {
                completedDays: Array.from(state.completedDays),
                completedReadings: Array.from(state.completedReadings),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('bible365_progress', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }

    function saveTheme() {
        localStorage.setItem('bible365_theme', state.theme);
    }

    function saveLanguage() {
        localStorage.setItem('bible365_language', state.language);
    }

    // ============================================
    // Theme Functions
    // ============================================
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
    }

    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme();
        saveTheme();
    }

    // ============================================
    // Language Functions
    // ============================================
    function applyLanguage() {
        // Update active button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (state.language === 'id') {
            elements.langId.classList.add('active');
        } else {
            elements.langEn.classList.add('active');
        }
    }

    function setLanguage(lang) {
        if (lang === state.language) return;

        state.language = lang;
        applyLanguage();
        saveLanguage();

        // If in reading view, refresh the content
        if (state.currentView === 'reading' && state.selectedDay) {
            renderReadingView(state.selectedDay);
            showToast(
                lang === 'id' ? '🇮🇩 Bahasa Indonesia dipilih' : '🇺🇸 English selected',
                'info'
            );
        }
    }

    // ============================================
    // Calendar Functions
    // ============================================
    function generateCalendar() {
        elements.calendarGrid.innerHTML = '';

        const today = getDayOfYear();

        for (let day = 1; day <= 365; day++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.textContent = day;
            cell.dataset.day = day;

            if (state.completedDays.has(day)) {
                cell.classList.add('completed');
            }

            if (day === today) {
                cell.classList.add('today');
            }

            cell.addEventListener('click', () => openReadingView(day));
            elements.calendarGrid.appendChild(cell);
        }

        applyFilter(state.currentFilter);
    }

    function getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    function applyFilter(filter) {
        state.currentFilter = filter;
        const cells = elements.calendarGrid.querySelectorAll('.day-cell');

        cells.forEach(cell => {
            const day = parseInt(cell.dataset.day);
            const isCompleted = state.completedDays.has(day);

            cell.classList.remove('hidden');

            if (filter === 'completed' && !isCompleted) {
                cell.classList.add('hidden');
            } else if (filter === 'pending' && isCompleted) {
                cell.classList.add('hidden');
            }
        });

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    }

    // ============================================
    // Statistics Functions
    // ============================================
    function updateStats() {
        const completed = state.completedDays.size;
        const percentage = Math.round((completed / 365) * 100);

        // Update progress bar
        elements.progressBar.style.width = `${percentage}%`;
        elements.progressPercentage.textContent = `${percentage}%`;
        elements.progressInfoText.textContent = `${completed} dari 365 hari`;

        // Update stat cards
        elements.daysCompleted.textContent = completed;
        elements.currentStreak.textContent = calculateStreak();
        elements.chaptersRead.textContent = calculateChaptersRead();
    }

    function calculateStreak() {
        let streak = 0;
        const today = getDayOfYear();

        for (let day = today; day >= 1; day--) {
            if (state.completedDays.has(day)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    function calculateChaptersRead() {
        let total = 0;
        state.completedDays.forEach(day => {
            const dayData = window.BibleData.READING_PLAN[day - 1];
            if (dayData) {
                total += dayData.readings.length;
            }
        });
        return total;
    }

    // ============================================
    // View Functions
    // ============================================
    function switchView(view) {
        state.currentView = view;

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });

        if (view === 'dashboard') {
            elements.dashboardView.classList.add('active');
        } else {
            elements.readingView.classList.add('active');
        }
    }

    function openReadingView(day) {
        state.selectedDay = day;
        switchView('reading');
        renderReadingView(day);
    }

    function renderReadingView(day) {
        const dayData = window.BibleData.READING_PLAN[day - 1];
        if (!dayData) return;

        // Update header
        elements.readingDayTitle.textContent = `Hari ${day}`;
        elements.readingDate.textContent = formatDate(day);

        // Update complete button
        updateCompleteButton(day);
        updateDailyProgress(day);

        // Render readings
        elements.readingsList.innerHTML = '';

        dayData.readings.forEach((reading, index) => {
            const card = createReadingCard(reading, index);
            elements.readingsList.appendChild(card);
        });
    }

    function formatDate(dayOfYear) {
        const date = new Date(new Date().getFullYear(), 0, dayOfYear);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }

    function createReadingCard(reading, index) {
        const card = document.createElement('div');
        card.className = 'reading-card';

        const bookName = reading.replace(/\s\d+$/, '');
        const icon = window.BibleData.getBookIcon(reading);
        const day = state.selectedDay;
        const readingKey = `${day}-${index}`;
        const isRead = state.completedReadings.has(readingKey);

        card.innerHTML = `
            <div class="reading-card-header">
                <div class="reading-card-title">
                    <div class="book-icon">${icon}</div>
                    <div>
                        <h4>${reading}</h4>
                        <span>${getBookDescription(bookName)}</span>
                    </div>
                </div>
                <button class="toggle-read-btn ${isRead ? 'checked' : ''}" data-index="${index}" aria-label="Tandai dibaca">
                    <span class="check-icon">✓</span>
                </button>
            </div>
            <div class="reading-card-content">
                <div class="reading-passage" id="passage-${index}">
                    <div class="loading-passage" data-passage="${reading}">
                        <div class="loading-spinner"></div>
                        <p>${state.language === 'id' ? 'Memuat' : 'Loading'} ${reading}...</p>
                    </div>
                </div>
                <div class="exegesis-panel">
                    <button class="exegesis-toggle" data-reading="${reading}" data-index="${index}">
                        <div class="exegesis-toggle-content">
                            <span class="exegesis-icon">✨</span>
                            <div>
                                <h5>${state.language === 'id' ? 'Eksegesis AI' : 'AI Exegesis'}</h5>
                                <small>${state.language === 'id' ? 'Analisis bahasa asli (Ibrani/Yunani)' : 'Original language analysis (Hebrew/Greek)'}</small>
                            </div>
                        </div>
                        <span class="toggle-arrow">▼</span>
                    </button>
                    <div class="exegesis-content ai-content" id="exegesis-${index}" data-reading="${reading}">
                        <div class="ai-placeholder">
                            <p>${state.language === 'id' ? 'Klik untuk membuka dan generate eksegesis AI...' : 'Click to open and generate AI exegesis...'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add reading toggle event
        const readBtn = card.querySelector('.toggle-read-btn');
        readBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleReadingComplete(index, readBtn);
        });

        // Add toggle event - Auto generate AI on expand
        const toggle = card.querySelector('.exegesis-toggle');
        const content = card.querySelector('.exegesis-content');
        const toggleReading = toggle.dataset.reading;
        const toggleIndex = toggle.dataset.index;

        toggle.addEventListener('click', async () => {
            const isExpanding = !toggle.classList.contains('active');
            toggle.classList.toggle('active');
            content.classList.toggle('active');

            // Auto-generate AI when expanding (if not already loaded)
            if (isExpanding && !content.dataset.loaded && window.AIExegesis) {
                await generateAIExegesis(toggleReading, toggleIndex, content);
            }
        });

        // Fetch passage from API
        const passageContainer = card.querySelector(`#passage-${index}`);
        loadPassageFromAPI(reading, passageContainer);

        return card;
    }

    /**
     * Generate AI Exegesis for a passage
     */
    async function generateAIExegesis(reading, index, container, forceRefresh = false) {
        const isId = state.language === 'id';

        // Show loading state
        container.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loading-spinner"></div>
                <p>${isId ? 'Menganalisis teks dan bahasa asli...' : 'Analyzing text and original language...'}</p>
                <small>${isId ? 'Ini mungkin memerlukan beberapa detik' : 'This may take a few seconds'}</small>
            </div>
        `;

        try {
            const result = await window.AIExegesis.generateExegesis(reading, state.language, forceRefresh);

            if (result.success) {
                container.innerHTML = window.AIExegesis.formatExegesisHTML(result, state.language);
                container.dataset.loaded = 'true';

                // Add regenerate button event
                const regenerateBtn = container.querySelector('.regenerate-ai-btn');
                if (regenerateBtn) {
                    regenerateBtn.addEventListener('click', () => {
                        container.dataset.loaded = '';
                        generateAIExegesis(reading, index, container, true);
                    });
                }

                // Auto-fetch cross references
                const autoFetchContainers = container.querySelectorAll('.cross-ref-verse.auto-fetch');
                autoFetchContainers.forEach(verseContainer => {
                    const reference = verseContainer.dataset.reference;
                    // Fetch in parallel (no await)
                    window.AIExegesis.fetchCrossRefVerse(reference, verseContainer, state.language);
                });
            } else {
                container.innerHTML = `
                    <div class="ai-error">
                        <p>⚠️ ${result.error || (isId ? 'Gagal menghasilkan eksegesis' : 'Failed to generate exegesis')}</p>
                        <button class="retry-ai-btn">${isId ? 'Coba Lagi' : 'Try Again'}</button>
                    </div>
                `;

                // Add retry button event
                const retryBtn = container.querySelector('.retry-ai-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        generateAIExegesis(reading, index, container, true);
                    });
                }
            }
        } catch (error) {
            console.error('Error generating AI exegesis:', error);
            container.innerHTML = `
                <div class="ai-error">
                    <p>⚠️ ${error.message || (isId ? 'Terjadi kesalahan' : 'An error occurred')}</p>
                    <button class="retry-ai-btn">${isId ? 'Coba Lagi' : 'Try Again'}</button>
                </div>
            `;

            const retryBtn = container.querySelector('.retry-ai-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    generateAIExegesis(reading, index, container, true);
                });
            }
        }
    }

    /**
     * Load passage from Bible API or local data based on language setting
     * @param {string} reading - Passage reference (e.g., "Kejadian 1")
     * @param {HTMLElement} container - Container element to render into
     */
    async function loadPassageFromAPI(reading, container) {
        // If Indonesian language is selected, try local data first
        if (state.language === 'id') {
            const result = window.BibleData.getIndonesianPassage(reading);
            if (result.success) {
                container.innerHTML = result.html;
                return;
            }
            // If no local Indonesian data, fallback to English API with note
        }

        // Use the API (for English or when Indonesian not available)
        if (!window.BibleAPI) {
            container.innerHTML = window.BibleData.getPassageText(reading);
            return;
        }

        // Show loading
        container.innerHTML = `
            <div class="loading-passage">
                <div class="loading-spinner"></div>
                <p>${state.language === 'id' ? 'Memuat ayat...' : 'Loading passage...'}</p>
            </div>
        `;

        try {
            const result = await window.BibleAPI.fetchPassage(reading, state.language);

            if (result.success && result.verses.length > 0) {
                const html = `
                    <div class="translation-badge">${result.translation}</div>
                    ${window.BibleAPI.formatVersesHtml(result.verses)}
                `;
                container.innerHTML = html;
            } else {
                // Fallback to local data if API fails
                container.innerHTML = `
                    <div class="passage-error">
                        <p>⚠️ ${state.language === 'id' ? 'Gagal memuat ayat' : 'Cannot load from API'}</p>
                        <small>${result.error || 'Unknown error'}</small>
                        <button class="retry-btn" data-passage="${reading}">${state.language === 'id' ? 'Coba Lagi' : 'Retry'}</button>
                    </div>
                `;

                // Add retry handler
                const retryBtn = container.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        window.BibleAPI.clearCache();
                        loadPassageFromAPI(reading, container);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading passage:', error);
            // Fallback to static content
            container.innerHTML = window.BibleData.getPassageText(reading);
        }
    }

    function getBookDescription(bookName) {
        const descriptions = {
            'Kejadian': 'Taurat - Kitab Permulaan',
            'Keluaran': 'Taurat - Pembebasan Israel',
            'Imamat': 'Taurat - Hukum Imamat',
            'Bilangan': 'Taurat - Perjalanan di Padang',
            'Ulangan': 'Taurat - Pengulangan Hukum',
            'Mazmur': 'Puisi - Nyanyian Pujian',
            'Amsal': 'Hikmat - Pengajaran Praktis',
            'Matius': 'Injil - Yesus sang Raja',
            'Markus': 'Injil - Yesus sang Hamba',
            'Lukas': 'Injil - Yesus Anak Manusia',
            'Yohanes': 'Injil - Yesus Anak Allah',
            'Kisah Para Rasul': 'Sejarah Gereja Mula-mula',
            'Roma': 'Surat Paulus - Doktrin Keselamatan',
            'Wahyu': 'Nubuatan - Akhir Zaman'
        };
        return descriptions[bookName] || 'Firman Allah';
    }

    function renderExegesis(exegesis) {
        let keywordsHtml = '';
        if (typeof exegesis.keywords === 'object') {
            for (const [term, meaning] of Object.entries(exegesis.keywords)) {
                keywordsHtml += `<li><strong>${term}:</strong> ${meaning}</li>`;
            }
        }

        let themesHtml = exegesis.themes.map(t => `<li>${t}</li>`).join('');

        return `
            <div class="exegesis-section">
                <h6>📜 Konteks Historis</h6>
                <p>${exegesis.context}</p>
            </div>
            <div class="exegesis-section">
                <h6>🔤 Kata Kunci</h6>
                <ul>${keywordsHtml}</ul>
            </div>
            <div class="exegesis-section">
                <h6>💡 Tema Utama</h6>
                <ul>${themesHtml}</ul>
            </div>
            <div class="exegesis-section">
                <h6>🎯 Aplikasi Praktis</h6>
                <p>${exegesis.application}</p>
            </div>
        `;
    }

    // ============================================
    // Complete Day Functions
    // ============================================
    function updateCompleteButton(day) {
        const isCompleted = state.completedDays.has(day);
        elements.markCompleteBtn.classList.toggle('completed', isCompleted);
        elements.markCompleteBtn.querySelector('.btn-text').textContent =
            isCompleted ? 'Sudah Selesai' : 'Tandai Selesai';
    }

    function updateDailyProgress(day) {
        const dayData = window.BibleData.READING_PLAN.find(p => p.day === day);
        if (!dayData) return;

        const total = dayData.readings.length;
        let completed = 0;

        for (let i = 0; i < total; i++) {
            if (state.completedReadings.has(`${day}-${i}`)) {
                completed++;
            }
        }

        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        const percentEl = document.getElementById('daily-progress-percent');
        const textEl = document.getElementById('daily-progress-text');
        const fillEl = document.getElementById('daily-progress-fill');

        if (percentEl) percentEl.textContent = `${percentage}%`;
        if (textEl) textEl.textContent = `${completed} dari ${total} selesai`;
        if (fillEl) fillEl.style.width = `${percentage}%`;
    }

    function toggleReadingComplete(index, btnElement) {
        const day = state.selectedDay;
        if (!day) return;

        const key = `${day}-${index}`;

        if (state.completedReadings.has(key)) {
            state.completedReadings.delete(key);
            btnElement.classList.remove('checked');

            // If day was marked complete, unmark it since not all are done now
            if (state.completedDays.has(day)) {
                state.completedDays.delete(day);
                updateCompleteButton(day);
            }
        } else {
            state.completedReadings.add(key);
            btnElement.classList.add('checked');

            // Check if all readings for this day are complete
            const dayData = window.BibleData.READING_PLAN.find(p => p.day === day);
            if (dayData) {
                const totalReadings = dayData.readings.length;
                let allDone = true;
                for (let i = 0; i < totalReadings; i++) {
                    if (!state.completedReadings.has(`${day}-${i}`)) {
                        allDone = false;
                        break;
                    }
                }

                if (allDone) {
                    state.completedDays.add(day);
                    updateCompleteButton(day);
                    showToast('🎉 Semua bacaan hari ini selesai!', 'success');
                }
            }
        }

        saveProgress();
        generateCalendar();
        updateStats();
        updateDailyProgress(day);
    }

    function toggleDayComplete() {
        const day = state.selectedDay;
        if (!day) return;

        const dayData = window.BibleData.READING_PLAN.find(p => p.day === day);
        if (!dayData) return;

        if (state.completedDays.has(day)) {
            state.completedDays.delete(day);
            // Unmark all readings for consistency
            dayData.readings.forEach((_, idx) => {
                state.completedReadings.delete(`${day}-${idx}`);
            });
            showToast('Bacaan ditandai belum selesai', 'info');
        } else {
            state.completedDays.add(day);
            // Mark all readings complete
            dayData.readings.forEach((_, idx) => {
                state.completedReadings.add(`${day}-${idx}`);
            });
            showToast('🎉 Hari ini selesai! Semangat!', 'success');
        }

        // Update all toggle buttons in the view
        const btns = elements.readingsList.querySelectorAll('.toggle-read-btn');
        btns.forEach(btn => {
            const idx = btn.dataset.index;
            if (state.completedReadings.has(`${day}-${idx}`)) {
                btn.classList.add('checked');
            } else {
                btn.classList.remove('checked');
            }
        });

        saveProgress();
        updateCompleteButton(day);
        generateCalendar();
        updateStats();
        updateDailyProgress(day);
    }

    // ============================================
    // Toast Notifications
    // ============================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastIn 0.25s ease reverse';
            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }

    // ============================================
    // Modal Functions
    // ============================================
    function openModal(title, content) {
        elements.modalTitle.textContent = title;
        elements.modalContent.innerHTML = content;
        elements.modalOverlay.classList.add('active');
    }

    function closeModal() {
        elements.modalOverlay.classList.remove('active');
    }

    // ============================================
    // Event Listeners
    // ============================================
    function initEventListeners() {
        // Navigation
        elements.navDashboard.addEventListener('click', () => switchView('dashboard'));
        elements.navReading.addEventListener('click', () => {
            if (state.selectedDay) {
                switchView('reading');
            } else {
                openReadingView(getDayOfYear());
            }
        });

        // Theme
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Language Toggle
        elements.langId.addEventListener('click', () => setLanguage('id'));
        elements.langEn.addEventListener('click', () => setLanguage('en'));

        // Back button
        elements.backToDashboard.addEventListener('click', () => switchView('dashboard'));

        // Complete button
        elements.markCompleteBtn.addEventListener('click', toggleDayComplete);

        // Filters
        elements.filterAll.addEventListener('click', () => applyFilter('all'));
        elements.filterCompleted.addEventListener('click', () => applyFilter('completed'));
        elements.filterPending.addEventListener('click', () => applyFilter('pending'));

        // Modal
        elements.modalClose.addEventListener('click', closeModal);
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) {
                closeModal();
            }
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
                if (state.currentView === 'reading') {
                    switchView('dashboard');
                }
            }
        });

        // Back to Top
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            }, { passive: true });

            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // ============================================
    // Initialization
    // ============================================
    function setupQuizListeners() {
        const quizModal = document.getElementById('quiz-modal');
        const quizBtn = document.getElementById('open-quiz-btn');
        const closeBtn = quizModal?.querySelector('.modal-close');

        if (quizBtn && quizModal) {
            quizBtn.addEventListener('click', () => {
                const container = document.getElementById('quiz-content-area');
                const isId = state.language === 'id';

                // Show Start Screen with dynamic content based on day
                const day = state.selectedDay;
                const date = formatDate(day);

                container.innerHTML = `
                    <div class="quiz-intro">
                        <div style="font-size:3rem; margin-bottom:1rem;">⚡</div>
                        <h4 style="margin-bottom:1rem;">${isId ? 'Kuis Harian: ' + date : 'Daily Quiz: ' + date}</h4>
                        <p style="font-size:1rem; line-height:1.6; color:var(--color-text-secondary); margin-bottom:2rem;">
                            ${isId
                        ? 'Uji pemahamanmu dari bacaan hari ini dengan 5 pertanyaan pilihan ganda yang dibuat oleh AI.'
                        : 'Test your understanding of today\'s readings with 5 AI-generated multiple choice questions.'}
                        </p>
                        <button id="start-quiz-inner-btn" class="primary-btn">
                            ${isId ? 'Mulai Kuis' : 'Start Quiz'}
                        </button>
                    </div>
                `;

                // Bind Start Button Logic
                const startBtn = document.getElementById('start-quiz-inner-btn');
                startBtn.addEventListener('click', () => {
                    const dayData = window.BibleData.READING_PLAN.find(p => p.day === day);
                    if (dayData) {
                        AIQuiz.startQuiz(dayData.day, dayData.readings, container, state.language);
                    }
                });

                quizModal.classList.add('active');
            });

            // Close events
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    quizModal.classList.remove('active');
                });
            }

            quizModal.addEventListener('click', (e) => {
                if (e.target === quizModal) {
                    quizModal.classList.remove('active');
                }
            });
        }
    }

    // ============================================
    // Initialization
    // ============================================
    function init() {
        loadProgress();
        applyTheme();
        applyLanguage();
        generateCalendar();
        updateStats();
        initEventListeners();
        setupQuizListeners();

        // Open today's reading by default if URL has hash
        if (window.location.hash === '#today') {
            openReadingView(getDayOfYear());
        }

        console.log('📖 Bible 365 initialized successfully!');
        console.log(`🌐 Language: ${state.language === 'id' ? 'Indonesian' : 'English'}`);
    }

    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
