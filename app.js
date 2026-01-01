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
        navStudy: document.getElementById('nav-study'),
        themeToggle: document.getElementById('theme-toggle'),

        // Language Toggle
        langId: document.getElementById('lang-id'),
        langEn: document.getElementById('lang-en'),

        // Views
        dashboardView: document.getElementById('dashboard-view'),
        readingView: document.getElementById('reading-view'),
        studyView: document.getElementById('study-view'),

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
        } else if (view === 'reading') {
            elements.readingView.classList.add('active');
        } else if (view === 'study') {
            elements.studyView.classList.add('active');
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
        elements.navStudy.addEventListener('click', () => switchView('study'));

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

    function checkAuth() {
        const lockScreen = document.getElementById('lock-screen');
        const unlockBtn = document.getElementById('unlock-btn');
        const passInput = document.getElementById('lock-password');
        const errorMsg = document.getElementById('lock-error');
        const toggleBtn = document.getElementById('toggle-password');

        if (!lockScreen) return;

        // Toggle Password Visibility
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passInput.setAttribute('type', type);

                // Toggle icons
                toggleBtn.querySelector('.eye-open').classList.toggle('hidden');
                toggleBtn.querySelector('.eye-closed').classList.toggle('hidden');
            });
        }

        // Check if already authenticated
        if (sessionStorage.getItem('auth') === 'true') {
            lockScreen.classList.add('hidden');
            return;
        }

        async function tryUnlock() {
            const val = passInput.value;
            // Use hashed password
            const hash = await sha256(val);

            if (hash === appConfig.passwordHash) {
                sessionStorage.setItem('auth', 'true');
                lockScreen.classList.add('hidden');
                errorMsg.classList.add('hidden');
                // Optional: play sound or animate
                lockScreen.style.opacity = '0';
                setTimeout(() => lockScreen.style.display = 'none', 500);
            } else {
                errorMsg.classList.remove('hidden');
                passInput.value = '';
                passInput.focus();
            }
        }

        async function sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        unlockBtn.addEventListener('click', tryUnlock);
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') tryUnlock();
        });
    }

    function setupStudyView() {
        const bookSelect = document.getElementById('book-select');
        const chapterSelect = document.getElementById('chapter-select');
        const verseSelect = document.getElementById('verse-select');
        const generateBtn = document.getElementById('manual-generate-btn');
        const resultContainer = document.getElementById('manual-exegesis-result');
        const previewContainer = document.getElementById('selected-reference-preview');

        if (!bookSelect || !chapterSelect || !generateBtn || !resultContainer) {
            console.error('Study view elements not found');
            return;
        }

        console.log('📚 Study view initialized, resultContainer:', resultContainer);

        // Bible books data - combining OT and NT
        const ALL_BOOKS = [
            // Old Testament
            { name: 'Kejadian', chapters: 50, maxVerses: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26] },
            { name: 'Keluaran', chapters: 40, maxVerses: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38] },
            { name: 'Imamat', chapters: 27, maxVerses: [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34] },
            { name: 'Bilangan', chapters: 36, maxVerses: [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13] },
            { name: 'Ulangan', chapters: 34, maxVerses: [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12] },
            { name: 'Yosua', chapters: 24, maxVerses: [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33] },
            { name: 'Hakim-hakim', chapters: 21, maxVerses: [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25] },
            { name: 'Rut', chapters: 4, maxVerses: [22, 23, 18, 22] },
            { name: '1 Samuel', chapters: 31, maxVerses: [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13] },
            { name: '2 Samuel', chapters: 24, maxVerses: [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25] },
            { name: '1 Raja-raja', chapters: 22, maxVerses: [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53] },
            { name: '2 Raja-raja', chapters: 25, maxVerses: [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30] },
            { name: '1 Tawarikh', chapters: 29, maxVerses: [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30] },
            { name: '2 Tawarikh', chapters: 36, maxVerses: [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23] },
            { name: 'Ezra', chapters: 10, maxVerses: [11, 70, 13, 24, 17, 22, 28, 36, 15, 44] },
            { name: 'Nehemia', chapters: 13, maxVerses: [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31] },
            { name: 'Ester', chapters: 10, maxVerses: [22, 23, 15, 17, 14, 14, 10, 17, 32, 3] },
            { name: 'Ayub', chapters: 42, maxVerses: [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17] },
            { name: 'Mazmur', chapters: 150, maxVerses: [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6] },
            { name: 'Amsal', chapters: 31, maxVerses: [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31] },
            { name: 'Pengkhotbah', chapters: 12, maxVerses: [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14] },
            { name: 'Kidung Agung', chapters: 8, maxVerses: [17, 17, 11, 16, 16, 13, 13, 14] },
            { name: 'Yesaya', chapters: 66, maxVerses: [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24] },
            { name: 'Yeremia', chapters: 52, maxVerses: [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34] },
            { name: 'Ratapan', chapters: 5, maxVerses: [22, 22, 66, 22, 22] },
            { name: 'Yehezkiel', chapters: 48, maxVerses: [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35] },
            { name: 'Daniel', chapters: 12, maxVerses: [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13] },
            { name: 'Hosea', chapters: 14, maxVerses: [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9] },
            { name: 'Yoel', chapters: 3, maxVerses: [20, 32, 21] },
            { name: 'Amos', chapters: 9, maxVerses: [15, 16, 15, 13, 27, 14, 17, 14, 15] },
            { name: 'Obaja', chapters: 1, maxVerses: [21] },
            { name: 'Yunus', chapters: 4, maxVerses: [17, 10, 10, 11] },
            { name: 'Mikha', chapters: 7, maxVerses: [16, 13, 12, 13, 15, 16, 20] },
            { name: 'Nahum', chapters: 3, maxVerses: [15, 13, 19] },
            { name: 'Habakuk', chapters: 3, maxVerses: [17, 20, 19] },
            { name: 'Zefanya', chapters: 3, maxVerses: [18, 15, 20] },
            { name: 'Hagai', chapters: 2, maxVerses: [15, 23] },
            { name: 'Zakharia', chapters: 14, maxVerses: [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21] },
            { name: 'Maleakhi', chapters: 4, maxVerses: [14, 17, 18, 6] },
            // New Testament
            { name: 'Matius', chapters: 28, maxVerses: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20] },
            { name: 'Markus', chapters: 16, maxVerses: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20] },
            { name: 'Lukas', chapters: 24, maxVerses: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53] },
            { name: 'Yohanes', chapters: 21, maxVerses: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25] },
            { name: 'Kisah Para Rasul', chapters: 28, maxVerses: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31] },
            { name: 'Roma', chapters: 16, maxVerses: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27] },
            { name: '1 Korintus', chapters: 16, maxVerses: [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24] },
            { name: '2 Korintus', chapters: 13, maxVerses: [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14] },
            { name: 'Galatia', chapters: 6, maxVerses: [24, 21, 29, 31, 26, 18] },
            { name: 'Efesus', chapters: 6, maxVerses: [23, 22, 21, 32, 33, 24] },
            { name: 'Filipi', chapters: 4, maxVerses: [30, 30, 21, 23] },
            { name: 'Kolose', chapters: 4, maxVerses: [29, 23, 25, 18] },
            { name: '1 Tesalonika', chapters: 5, maxVerses: [10, 20, 13, 18, 28] },
            { name: '2 Tesalonika', chapters: 3, maxVerses: [12, 17, 18] },
            { name: '1 Timotius', chapters: 6, maxVerses: [20, 15, 16, 16, 25, 21] },
            { name: '2 Timotius', chapters: 4, maxVerses: [18, 26, 17, 22] },
            { name: 'Titus', chapters: 3, maxVerses: [16, 15, 15] },
            { name: 'Filemon', chapters: 1, maxVerses: [25] },
            { name: 'Ibrani', chapters: 13, maxVerses: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25] },
            { name: 'Yakobus', chapters: 5, maxVerses: [27, 26, 18, 17, 20] },
            { name: '1 Petrus', chapters: 5, maxVerses: [25, 25, 22, 19, 14] },
            { name: '2 Petrus', chapters: 3, maxVerses: [21, 22, 18] },
            { name: '1 Yohanes', chapters: 5, maxVerses: [10, 29, 24, 21, 21] },
            { name: '2 Yohanes', chapters: 1, maxVerses: [13] },
            { name: '3 Yohanes', chapters: 1, maxVerses: [14] },
            { name: 'Yudas', chapters: 1, maxVerses: [25] },
            { name: 'Wahyu', chapters: 22, maxVerses: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21] }
        ];

        // Get book icon helper
        function getBookIcon(bookName) {
            if (window.BibleData && window.BibleData.getBookIcon) {
                return window.BibleData.getBookIcon(bookName);
            }
            return '📖';
        }

        // Populate books dropdown
        function populateBooks() {
            bookSelect.innerHTML = '<option value="">-- Pilih Kitab --</option>';

            // Add OT header
            const otOptGroup = document.createElement('optgroup');
            otOptGroup.label = '📜 Perjanjian Lama';

            // OT books (first 39)
            ALL_BOOKS.slice(0, 39).forEach((book, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = book.name;
                otOptGroup.appendChild(option);
            });
            bookSelect.appendChild(otOptGroup);

            // Add NT header
            const ntOptGroup = document.createElement('optgroup');
            ntOptGroup.label = '✝️ Perjanjian Baru';

            // NT books (from index 39)
            ALL_BOOKS.slice(39).forEach((book, idx) => {
                const option = document.createElement('option');
                option.value = idx + 39;
                option.textContent = book.name;
                ntOptGroup.appendChild(option);
            });
            bookSelect.appendChild(ntOptGroup);
        }

        // Populate chapters based on selected book
        function populateChapters(bookIndex) {
            const book = ALL_BOOKS[bookIndex];
            chapterSelect.innerHTML = '<option value="">-- Pilih Pasal --</option>';

            for (let i = 1; i <= book.chapters; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Pasal ${i}`;
                chapterSelect.appendChild(option);
            }

            chapterSelect.disabled = false;
            verseSelect.innerHTML = '<option value="">-- Semua Ayat --</option>';
            verseSelect.disabled = true;
        }

        // Populate verses based on selected chapter
        function populateVerses(bookIndex, chapterIndex) {
            const book = ALL_BOOKS[bookIndex];
            const maxVerse = book.maxVerses[chapterIndex - 1] || 30;

            verseSelect.innerHTML = '<option value="">-- Semua Ayat --</option>';

            for (let i = 1; i <= maxVerse; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Ayat ${i}`;
                verseSelect.appendChild(option);
            }

            verseSelect.disabled = false;
        }

        // Update reference preview
        function updatePreview() {
            const bookIndex = bookSelect.value;
            const chapter = chapterSelect.value;
            const verse = verseSelect.value;

            if (!bookIndex || !chapter) {
                previewContainer.innerHTML = '';
                generateBtn.disabled = true;
                return;
            }

            const book = ALL_BOOKS[bookIndex];
            let reference = `${book.name} ${chapter}`;
            if (verse) {
                reference += `:${verse}`;
            }

            const icon = getBookIcon(book.name);
            previewContainer.innerHTML = `
                <span class="reference-icon">${icon}</span>
                <span class="reference-text">${reference}</span>
            `;
            generateBtn.disabled = false;
        }

        // Get current reference
        function getCurrentReference() {
            const bookIndex = bookSelect.value;
            const chapter = chapterSelect.value;
            const verse = verseSelect.value;

            if (!bookIndex || !chapter) return null;

            const book = ALL_BOOKS[bookIndex];
            let reference = `${book.name} ${chapter}`;
            if (verse) {
                reference += `:${verse}`;
            }
            return reference;
        }

        // Event listeners for dropdowns with auto-cascade
        bookSelect.addEventListener('change', () => {
            const bookIndex = bookSelect.value;
            if (bookIndex) {
                populateChapters(parseInt(bookIndex));
                // Auto-focus chapter dropdown with slight delay for mobile
                setTimeout(() => {
                    chapterSelect.focus();
                    // Try to open it on mobile by clicking
                    if ('ontouchstart' in window) {
                        const event = new MouseEvent('mousedown', { bubbles: true });
                        chapterSelect.dispatchEvent(event);
                    }
                }, 100);
            } else {
                chapterSelect.innerHTML = '<option value="">-- Pilih Pasal --</option>';
                chapterSelect.disabled = true;
                verseSelect.innerHTML = '<option value="">-- Semua Ayat --</option>';
                verseSelect.disabled = true;
            }
            updatePreview();
        });

        chapterSelect.addEventListener('change', () => {
            const bookIndex = bookSelect.value;
            const chapter = chapterSelect.value;
            if (bookIndex && chapter) {
                populateVerses(parseInt(bookIndex), parseInt(chapter));
                // Auto-focus verse dropdown
                setTimeout(() => {
                    verseSelect.focus();
                }, 100);
            } else {
                verseSelect.innerHTML = '<option value="">-- Semua Ayat --</option>';
                verseSelect.disabled = true;
            }
            updatePreview();
        });

        verseSelect.addEventListener('change', updatePreview);

        // Load passage content helper
        async function loadPassageContent(reference) {
            const isId = state.language === 'id';

            // Try local data first for Indonesian
            if (isId && window.BibleData && window.BibleData.INDONESIAN_PASSAGES) {
                const passageKey = reference.split(':')[0]; // Get "Kitab Pasal" part
                if (window.BibleData.INDONESIAN_PASSAGES[passageKey]) {
                    return {
                        success: true,
                        html: window.BibleData.INDONESIAN_PASSAGES[passageKey],
                        translation: 'Terjemahan Baru'
                    };
                }
            }

            // Fall back to API
            if (window.BibleAPI) {
                try {
                    const result = await window.BibleAPI.fetchPassage(reference, state.language);
                    if (result.success && result.verses.length > 0) {
                        return {
                            success: true,
                            html: window.BibleAPI.formatVersesHtml(result.verses),
                            translation: result.translation
                        };
                    }
                } catch (e) {
                    console.error('API error:', e);
                }
            }

            return { success: false, html: '', translation: '' };
        }

        // Generate Logic - Fixed and Enhanced
        const handleGenerate = async (forceRefresh = false) => {
            console.log('🔍 Generate button clicked!');

            const ref = getCurrentReference();
            const isId = state.language === 'id';

            console.log('📖 Reference:', ref);

            if (!ref) {
                showToast(isId ? 'Pilih kitab dan pasal terlebih dahulu' : 'Select book and chapter first', 'error');
                return;
            }

            // Disable button during generation
            generateBtn.disabled = true;
            generateBtn.innerHTML = `<span class="btn-icon">⏳</span><span>${isId ? 'Memproses...' : 'Processing...'}</span>`;

            // Show loading state with passage loading first
            resultContainer.innerHTML = `
                <div class="ai-loading">
                    <div class="ai-loading-spinner"></div>
                    <p>${isId ? '📖 Memuat ayat...' : '📖 Loading passage...'}</p>
                </div>
            `;

            try {
                // Step 1: Load passage content
                console.log('📖 Loading passage...');
                const passageResult = await loadPassageContent(ref);

                // Step 2: Show loading for exegesis with passage visible
                resultContainer.innerHTML = `
                    <div class="passage-result-section">
                        <div class="passage-header">
                            <h4>📖 ${ref}</h4>
                            ${passageResult.translation ? `<span class="translation-badge">${passageResult.translation}</span>` : ''}
                        </div>
                        <div class="passage-text">
                            ${passageResult.success ? passageResult.html : `<p class="no-passage-text"><em>${isId ? 'Teks tidak tersedia secara lokal' : 'Text not available locally'}</em></p>`}
                        </div>
                    </div>
                    <div class="ai-loading" style="margin-top: var(--spacing-lg);">
                        <div class="ai-loading-spinner"></div>
                        <p>${isId ? '✨ Menghasilkan eksegesis AI...' : '✨ Generating AI exegesis...'}</p>
                        <small>${isId ? 'Ini mungkin memerlukan beberapa detik' : 'This may take a few seconds'}</small>
                    </div>
                `;

                // Step 3: Generate exegesis
                console.log('✨ Generating exegesis...');
                const result = await window.AIExegesis.generateExegesis(ref, state.language, forceRefresh);

                if (result.success) {
                    console.log('✅ Exegesis result:', result);

                    // Format the exegesis HTML
                    const exegesisHTML = window.AIExegesis.formatExegesisHTML(result, state.language);
                    console.log('📄 Exegesis HTML length:', exegesisHTML.length);

                    // Show passage + exegesis
                    resultContainer.innerHTML = `
                        <div class="passage-result-section">
                            <div class="passage-header">
                                <h4>📖 ${ref}</h4>
                                ${passageResult.translation ? `<span class="translation-badge">${passageResult.translation}</span>` : ''}
                            </div>
                            <div class="passage-text">
                                ${passageResult.success ? passageResult.html : `<p class="no-passage-text"><em>${isId ? 'Teks tidak tersedia secara lokal, lihat eksegesis di bawah' : 'Text not available locally, see exegesis below'}</em></p>`}
                            </div>
                        </div>
                        <div class="exegesis-result-section">
                            ${exegesisHTML}
                        </div>
                    `;

                    console.log('📦 Result container updated, innerHTML length:', resultContainer.innerHTML.length);

                    // Attach Listeners
                    const autoFetchContainers = resultContainer.querySelectorAll('.cross-ref-verse.auto-fetch');
                    autoFetchContainers.forEach(el => {
                        window.AIExegesis.fetchCrossRefVerse(el.dataset.reference, el, state.language);
                    });

                    const regenBtn = resultContainer.querySelector('.regenerate-ai-btn');
                    if (regenBtn) {
                        regenBtn.addEventListener('click', () => handleGenerate(true));
                    }

                    // Scroll to see results
                    setTimeout(() => {
                        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);

                    showToast(isId ? '✅ Eksegesis berhasil dibuat!' : '✅ Exegesis generated!', 'success');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Error generating exegesis:', error);
                resultContainer.innerHTML = `
                    <div class="ai-error">
                        <p>⚠️ ${error.message || (isId ? 'Gagal memuat eksegesis' : 'Failed to load exegesis')}</p>
                        <button class="retry-ai-btn">${isId ? 'Coba Lagi' : 'Try Again'}</button>
                    </div>
                `;
                resultContainer.querySelector('.retry-ai-btn')?.addEventListener('click', () => handleGenerate(true));
            } finally {
                // Re-enable button
                generateBtn.disabled = false;
                generateBtn.innerHTML = `<span class="btn-icon">🔍</span><span>Generate Eksegesis</span>`;
            }
        };

        // Attach click handler to button
        generateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🖱️ Button click event fired');
            handleGenerate(false);
        });

        // Initialize
        populateBooks();
    }

    // ============================================
    // Initialization
    // ============================================
    function init() {
        checkAuth(); // Protection first
        setupStudyView(); // Setup Study View Logic
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
