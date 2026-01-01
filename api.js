/**
 * Bible API Integration
 * Using bible-api.com for English and api.ayt.co for Indonesian
 */

(function () {
    'use strict';

    // Book name mapping: Indonesian -> English (for bible-api.com)
    const BOOK_NAME_MAP = {
        // Old Testament
        'Kejadian': 'Genesis',
        'Keluaran': 'Exodus',
        'Imamat': 'Leviticus',
        'Bilangan': 'Numbers',
        'Ulangan': 'Deuteronomy',
        'Yosua': 'Joshua',
        'Hakim-hakim': 'Judges',
        'Rut': 'Ruth',
        '1 Samuel': '1 Samuel',
        '2 Samuel': '2 Samuel',
        '1 Raja-raja': '1 Kings',
        '2 Raja-raja': '2 Kings',
        '1 Tawarikh': '1 Chronicles',
        '2 Tawarikh': '2 Chronicles',
        'Ezra': 'Ezra',
        'Nehemia': 'Nehemiah',
        'Ester': 'Esther',
        'Ayub': 'Job',
        'Mazmur': 'Psalms',
        'Amsal': 'Proverbs',
        'Pengkhotbah': 'Ecclesiastes',
        'Kidung Agung': 'Song of Solomon',
        'Yesaya': 'Isaiah',
        'Yeremia': 'Jeremiah',
        'Ratapan': 'Lamentations',
        'Yehezkiel': 'Ezekiel',
        'Daniel': 'Daniel',
        'Hosea': 'Hosea',
        'Yoel': 'Joel',
        'Amos': 'Amos',
        'Obaja': 'Obadiah',
        'Yunus': 'Jonah',
        'Mikha': 'Micah',
        'Nahum': 'Nahum',
        'Habakuk': 'Habakkuk',
        'Zefanya': 'Zephaniah',
        'Hagai': 'Haggai',
        'Zakharia': 'Zechariah',
        'Maleakhi': 'Malachi',
        // New Testament
        'Matius': 'Matthew',
        'Markus': 'Mark',
        'Lukas': 'Luke',
        'Yohanes': 'John',
        'Kisah Para Rasul': 'Acts',
        'Roma': 'Romans',
        '1 Korintus': '1 Corinthians',
        '2 Korintus': '2 Corinthians',
        'Galatia': 'Galatians',
        'Efesus': 'Ephesians',
        'Filipi': 'Philippians',
        'Kolose': 'Colossians',
        '1 Tesalonika': '1 Thessalonians',
        '2 Tesalonika': '2 Thessalonians',
        '1 Timotius': '1 Timothy',
        '2 Timotius': '2 Timothy',
        'Titus': 'Titus',
        'Filemon': 'Philemon',
        'Ibrani': 'Hebrews',
        'Yakobus': 'James',
        '1 Petrus': '1 Peter',
        '2 Petrus': '2 Peter',
        '1 Yohanes': '1 John',
        '2 Yohanes': '2 John',
        '3 Yohanes': '3 John',
        'Yudas': 'Jude',
        'Wahyu': 'Revelation'
    };

    // Book abbreviations for AYT API (Indonesian)
    const BOOK_ABBR_MAP = {
        'Kejadian': 'Kej', 'Keluaran': 'Kel', 'Imamat': 'Im', 'Bilangan': 'Bil',
        'Ulangan': 'Ul', 'Yosua': 'Yos', 'Hakim-hakim': 'Hak', 'Rut': 'Rut',
        '1 Samuel': '1Sam', '2 Samuel': '2Sam', '1 Raja-raja': '1Raj', '2 Raja-raja': '2Raj',
        '1 Tawarikh': '1Taw', '2 Tawarikh': '2Taw', 'Ezra': 'Ezr', 'Nehemia': 'Neh',
        'Ester': 'Est', 'Ayub': 'Ayub', 'Mazmur': 'Mzm', 'Amsal': 'Ams',
        'Pengkhotbah': 'Pkh', 'Kidung Agung': 'Kid', 'Yesaya': 'Yes', 'Yeremia': 'Yer',
        'Ratapan': 'Rat', 'Yehezkiel': 'Yeh', 'Daniel': 'Dan', 'Hosea': 'Hos',
        'Yoel': 'Yl', 'Amos': 'Am', 'Obaja': 'Ob', 'Yunus': 'Yun',
        'Mikha': 'Mi', 'Nahum': 'Nah', 'Habakuk': 'Hab', 'Zefanya': 'Zef',
        'Hagai': 'Hag', 'Zakharia': 'Za', 'Maleakhi': 'Mal',
        'Matius': 'Mat', 'Markus': 'Mrk', 'Lukas': 'Luk', 'Yohanes': 'Yoh',
        'Kisah Para Rasul': 'Kis', 'Roma': 'Rom', '1 Korintus': '1Kor', '2 Korintus': '2Kor',
        'Galatia': 'Gal', 'Efesus': 'Ef', 'Filipi': 'Flp', 'Kolose': 'Kol',
        '1 Tesalonika': '1Tes', '2 Tesalonika': '2Tes', '1 Timotius': '1Tim', '2 Timotius': '2Tim',
        'Titus': 'Tit', 'Filemon': 'Flm', 'Ibrani': 'Ibr', 'Yakobus': 'Yak',
        '1 Petrus': '1Ptr', '2 Petrus': '2Ptr', '1 Yohanes': '1Yoh', '2 Yohanes': '2Yoh',
        '3 Yohanes': '3Yoh', 'Yudas': 'Yud', 'Wahyu': 'Why'
    };

    // Single chapter books that need special handling
    const SINGLE_CHAPTER_BOOKS = ['Obadiah', 'Philemon', '2 John', '3 John', 'Jude'];

    // Cache for fetched passages
    const passageCache = new Map();

    // API Base URLs
    const API_BASE_EN = 'https://bible-api.com';
    const API_BASE_ID = 'https://api.ayt.co/v1/bible.php';

    /**
     * Convert Indonesian passage reference to English
     * @param {string} passage - Indonesian passage (e.g., "Kejadian 1")
     * @returns {object} - { bookEn, chapter, bookId }
     */
    function parsePassage(passage) {
        const match = passage.match(/^(.+?)\s+(\d+)$/);
        if (!match) return null;

        const bookId = match[1];
        const chapter = parseInt(match[2]);
        const bookEn = BOOK_NAME_MAP[bookId];

        if (!bookEn) {
            console.warn(`Unknown book: ${bookId}`);
            return null;
        }

        return { bookEn, chapter, bookId };
    }

    /**
     * Build API URL for a passage
     * @param {string} bookEn - English book name
     * @param {number} chapter - Chapter number
     * @returns {string} - API URL
     */
    function buildApiUrl(bookEn, chapter) {
        // Handle single-chapter books
        const isSingleChapter = SINGLE_CHAPTER_BOOKS.includes(bookEn);
        let reference;

        if (isSingleChapter && chapter === 1) {
            // For single-chapter books, request the whole book
            reference = encodeURIComponent(bookEn);
            return `${API_BASE_EN}/${reference}?single_chapter_book_matching=indifferent`;
        } else {
            reference = encodeURIComponent(`${bookEn} ${chapter}`);
            return `${API_BASE_EN}/${reference}`;
        }
    }

    /**
     * Fetch passage from Indonesian API (AYT)
     */
    async function fetchPassageIndonesian(passage) {
        const cacheKey = `id_${passage}`;
        if (passageCache.has(cacheKey)) {
            return passageCache.get(cacheKey);
        }

        const parsed = parsePassage(passage);
        if (!parsed) {
            return { success: false, error: 'Invalid passage format', passage };
        }

        const { chapter, bookId } = parsed;
        const bookAbbr = BOOK_ABBR_MAP[bookId];

        if (!bookAbbr) {
            return { success: false, error: 'Book not found', passage };
        }

        const url = `${API_BASE_ID}?book=${bookAbbr}&chapter=${chapter}&source=bible365app`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            // Parse AYT API response format
            const bookData = Object.values(data)[0];
            if (!bookData || !bookData.data) throw new Error('Invalid response');

            const chapterData = bookData.data[chapter];
            if (!chapterData) throw new Error('Chapter not found');

            const verses = Object.values(chapterData).map(v => ({
                verse: parseInt(v.verse),
                text: v.text,
                title: v.title || ''
            }));

            const result = {
                success: true,
                passage,
                reference: `${bookData.info.book_name} ${chapter}`,
                verses,
                translation: 'Alkitab Yang Terbuka (AYT)',
                translationNote: 'Terjemahan Indonesia'
            };

            passageCache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error(`Error fetching Indonesian ${passage}:`, error);
            return { success: false, error: error.message, passage };
        }
    }

    /**
     * Fetch passage from English API (bible-api.com)
     */
    async function fetchPassageEnglish(passage) {
        const cacheKey = `en_${passage}`;
        if (passageCache.has(cacheKey)) {
            return passageCache.get(cacheKey);
        }

        const parsed = parsePassage(passage);
        if (!parsed) {
            return { success: false, error: 'Invalid passage format', passage };
        }

        const { bookEn, chapter } = parsed;
        const url = buildApiUrl(bookEn, chapter);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            const result = {
                success: true,
                passage,
                reference: data.reference,
                verses: data.verses || [],
                text: data.text || '',
                translation: data.translation_name || 'World English Bible',
                translationNote: data.translation_note || ''
            };

            passageCache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error(`Error fetching ${passage}:`, error);
            return { success: false, error: error.message, passage };
        }
    }

    /**
     * Fetch passage from API (auto-selects based on language)
     * @param {string} passage - Indonesian passage reference
     * @param {string} language - 'id' or 'en'
     * @returns {Promise<object>} - Passage data
     */
    async function fetchPassage(passage, language = 'en') {
        if (language === 'id') {
            return fetchPassageIndonesian(passage);
        }
        return fetchPassageEnglish(passage);
    }

    /**
     * Format verses into HTML with verse numbers
     * @param {array} verses - Array of verse objects
     * @returns {string} - Formatted HTML
     */
    function formatVersesHtml(verses) {
        if (!verses || verses.length === 0) {
            return '<p><em>Tidak ada teks tersedia.</em></p>';
        }

        let html = '<p>';
        verses.forEach((verse, index) => {
            const verseNum = verse.verse;
            const text = verse.text.trim();
            html += `<span class="verse-number">${verseNum}</span>${text} `;

            // Add paragraph break every 5 verses for readability
            if ((index + 1) % 5 === 0 && index < verses.length - 1) {
                html += '</p><p>';
            }
        });
        html += '</p>';

        return html;
    }

    /**
     * Get loading placeholder HTML
     * @param {string} passage - Passage reference
     * @returns {string} - Loading HTML
     */
    function getLoadingHtml(passage) {
        return `
            <div class="loading-passage" data-passage="${passage}">
                <div class="loading-spinner"></div>
                <p>Memuat ${passage}...</p>
            </div>
        `;
    }

    /**
     * Get error HTML
     * @param {string} passage - Passage reference
     * @param {string} error - Error message
     * @returns {string} - Error HTML
     */
    function getErrorHtml(passage, error) {
        return `
            <div class="passage-error">
                <p>⚠️ Tidak dapat memuat ${passage}</p>
                <small>${error}</small>
                <button class="retry-btn" data-passage="${passage}">Coba Lagi</button>
            </div>
        `;
    }

    /**
     * Load and render a passage into a container
     * @param {string} passage - Passage reference
     * @param {HTMLElement} container - Target container element
     */
    async function loadPassageIntoContainer(passage, container) {
        // Show loading state
        container.innerHTML = getLoadingHtml(passage);

        const result = await fetchPassage(passage);

        if (result.success) {
            container.innerHTML = formatVersesHtml(result.verses);
            container.dataset.loaded = 'true';
        } else {
            container.innerHTML = getErrorHtml(passage, result.error);

            // Add retry handler
            const retryBtn = container.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    passageCache.delete(passage); // Clear cache
                    loadPassageIntoContainer(passage, container);
                });
            }
        }
    }

    /**
     * Prefetch multiple passages (for better UX)
     * @param {array} passages - Array of passage references
     */
    async function prefetchPassages(passages) {
        const promises = passages.map(passage => fetchPassage(passage));
        await Promise.allSettled(promises);
    }

    /**
     * Clear the passage cache
     */
    function clearCache() {
        passageCache.clear();
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache stats
     */
    function getCacheStats() {
        return {
            size: passageCache.size,
            keys: Array.from(passageCache.keys())
        };
    }

    // Export API
    window.BibleAPI = {
        fetchPassage,
        fetchPassageIndonesian,
        fetchPassageEnglish,
        formatVersesHtml,
        loadPassageIntoContainer,
        prefetchPassages,
        clearCache,
        getCacheStats,
        getLoadingHtml,
        parsePassage,
        BOOK_NAME_MAP,
        BOOK_ABBR_MAP
    };

})();
