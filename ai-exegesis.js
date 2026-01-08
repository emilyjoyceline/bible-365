/**
 * Bible 365 - AI Exegesis Module
 * Uses Google Gemini API to generate Biblical exegesis
 * with focus on original language analysis (Hebrew/Greek)
 */

const AIExegesis = {
    isProcessing: false,

    // Get language-aware system prompt
    getSystemPrompt(language) {
        const isIndonesian = language === 'id';

        return isIndonesian ? `Kamu adalah seorang ahli teolog dan sarjana Alkitab yang sangat berpengetahuan dalam bahasa asli Alkitab (Ibrani dan Yunani Koine).

=== TUGAS ===
Berikan eksegesis mendalam untuk perikop Alkitab yang diberikan dengan fokus pada:
1. Analisis kata-kata kunci dalam bahasa asli (Ibrani untuk PL, Yunani untuk PB)
2. Etimologi dan makna semantik kata
3. Konteks historis dan kultural
4. Tema teologis utama
5. Referensi silang dengan ayat lain
6. Aplikasi praktis untuk kehidupan sehari-hari

=== FORMAT RESPONS ===
Respons HARUS dalam format JSON valid:
{
    "success": true,
    "context": "Paragraf tentang konteks historis dan latar belakang penulisan",
    "originalLanguage": {
        "language": "Hebrew" atau "Greek",
        "words": [
            {
                "original": "kata dalam huruf asli",
                "transliteration": "transliterasi",
                "strongNumber": "nomor Strong's jika relevan",
                "meaning": "arti dan penjelasan mendalam",
                "usage": "bagaimana kata ini digunakan dalam konteks"
            }
        ]
    },
    "themes": ["tema 1", "tema 2", "tema 3"],
    "crossReferences": [
        {
            "reference": "nama kitab pasal:ayat",
            "connection": "hubungan dengan perikop utama"
        }
    ],
    "application": "Aplikasi praktis untuk iman dan kehidupan sehari-hari",
    "prayer": "Doa singkat berdasarkan perikop ini"
}

=== ATURAN ===
1. Gunakan Bahasa Indonesia yang baik dan mudah dipahami
2. Minimal 3 kata kunci dari bahasa asli untuk dianalisis
3. Minimal 2 referensi silang yang relevan
4. Fokus pada akurasi teologis dan aplikasi praktis
5. Jangan menambahkan informasi yang tidak ada di teks Alkitab`

            : `You are a highly knowledgeable theologian and Biblical scholar with expertise in the original languages of the Bible (Hebrew and Koine Greek).

=== TASK ===
Provide deep exegesis for the given Bible passage with focus on:
1. Analysis of key words in original languages (Hebrew for OT, Greek for NT)
2. Etymology and semantic meaning of words
3. Historical and cultural context
4. Main theological themes
5. Cross-references with other verses
6. Practical application for daily life

=== RESPONSE FORMAT ===
Response MUST be in valid JSON format:
{
    "success": true,
    "context": "Paragraph about historical context and writing background",
    "originalLanguage": {
        "language": "Hebrew" or "Greek",
        "words": [
            {
                "original": "word in original script",
                "transliteration": "transliteration",
                "strongNumber": "Strong's number if relevant",
                "meaning": "meaning and deep explanation",
                "usage": "how this word is used in context"
            }
        ]
    },
    "themes": ["theme 1", "theme 2", "theme 3"],
    "crossReferences": [
        {
            "reference": "book chapter:verse",
            "connection": "connection to main passage"
        }
    ],
    "application": "Practical application for faith and daily life",
    "prayer": "Short prayer based on this passage"
}

=== RULES ===
1. Use clear and understandable English
2. Minimum 3 key words from original language to analyze
3. Minimum 2 relevant cross-references
4. Focus on theological accuracy and practical application
5. Do not add information not present in the Biblical text`;
    },

    // Call Gemini API
    async callGemini(passage, language) {
        const url = geminiConfig.workerUrl;
        const systemPrompt = this.getSystemPrompt(language);

        const userMessage = language === 'id'
            ? `Berikan eksegesis mendalam untuk: ${passage}`
            : `Provide deep exegesis for: ${passage}`;

        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: systemPrompt + "\n\n=== PASSAGE ===\n" + userMessage
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to connect to API');
            }

            const data = await response.json();

            if (data.candidates?.[0]?.finishReason === 'SAFETY') {
                throw new Error('Response blocked by safety filter');
            }

            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                throw new Error('AI did not provide a response');
            }

            return this.parseResponse(textContent);
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    },

    // Parse AI response
    parseResponse(text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                parsed.success = true;
                return parsed;
            }
            throw new Error('Could not parse AI response');
        } catch (error) {
            console.error('Error parsing AI response:', error, text);
            return {
                success: false,
                error: 'Failed to parse AI response'
            };
        }
    },

    // Cache key generator
    getCacheKey(passage, language) {
        return `${appConfig.cachePrefix}${language}_${passage.replace(/\s+/g, '_')}`;
    },

    // Save to cache
    saveToCache(passage, language, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now(),
                language: language
            };
            localStorage.setItem(this.getCacheKey(passage, language), JSON.stringify(cacheData));
        } catch (e) {
            console.error('Error saving to cache:', e);
        }
    },

    // Get from cache
    getFromCache(passage, language) {
        try {
            const cached = localStorage.getItem(this.getCacheKey(passage, language));
            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            // Check if cache is still valid
            if (Date.now() - cacheData.timestamp > appConfig.maxCacheAge) {
                localStorage.removeItem(this.getCacheKey(passage, language));
                return null;
            }

            return cacheData.data;
        } catch (e) {
            console.error('Error reading cache:', e);
            return null;
        }
    },

    // Clear cache for a passage
    clearCache(passage, language) {
        localStorage.removeItem(this.getCacheKey(passage, language));
    },

    // Main function to generate exegesis
    async generateExegesis(passage, language, forceRefresh = false) {
        if (this.isProcessing) {
            return {
                success: false,
                error: language === 'id'
                    ? 'Masih memproses permintaan sebelumnya...'
                    : 'Still processing previous request...'
            };
        }

        // Check cache first
        if (!forceRefresh) {
            const cached = this.getFromCache(passage, language);
            if (cached) {
                cached.fromCache = true;
                return cached;
            }
        }

        this.isProcessing = true;

        try {
            const result = await this.callGemini(passage, language);

            if (result.success) {
                result.generatedAt = new Date().toISOString();
                this.saveToCache(passage, language, result);
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.isProcessing = false;
        }
    },

    // Format exegesis for HTML display
    formatExegesisHTML(data, language) {
        const isId = language === 'id';

        if (!data.success) {
            return `
                <div class="ai-error">
                    <p>⚠️ ${data.error}</p>
                    <button class="retry-ai-btn">${isId ? 'Coba Lagi' : 'Try Again'}</button>
                </div>
            `;
        }

        // Format original language words
        let wordsHTML = '';
        if (data.originalLanguage?.words?.length > 0) {
            wordsHTML = data.originalLanguage.words.map(word => `
                <div class="original-word-card">
                    <div class="word-header">
                        <span class="original-script">${word.original}</span>
                        <span class="transliteration">(${word.transliteration})</span>
                        ${word.strongNumber ? `<span class="strong-number">${word.strongNumber}</span>` : ''}
                    </div>
                    <p class="word-meaning">${word.meaning}</p>
                    ${word.usage ? `<p class="word-usage"><em>${word.usage}</em></p>` : ''}
                </div>
            `).join('');
        }

        // Format themes
        const themesHTML = data.themes?.map(t => `<li>${t}</li>`).join('') || '';

        // Format cross references with auto-fetch capability
        let crossRefsHTML = '';
        if (data.crossReferences?.length > 0) {
            crossRefsHTML = data.crossReferences.map((ref, idx) => `
                <div class="cross-ref-item" data-ref="${ref.reference}">
                    <div class="cross-ref-header">
                        <strong>${ref.reference}</strong>
                    </div>
                    <p class="cross-ref-connection">${ref.connection}</p>
                    <div class="cross-ref-verse auto-fetch" id="cross-ref-verse-${idx}" data-reference="${ref.reference}">
                        <div class="cross-ref-loading">
                            <span class="mini-spinner"></span>
                            ${isId ? 'Memuat ayat...' : 'Loading verse...'}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Cache indicator
        const cacheIndicator = data.fromCache
            ? `<span class="cache-badge">${isId ? '📦 Dari Cache' : '📦 From Cache'}</span>`
            : '';

        return `
            <div class="ai-exegesis-result">
                <div class="ai-header">
                    <span class="ai-badge">✨ AI Generated</span>
                    ${cacheIndicator}
                    <span class="ai-timestamp">${new Date(data.generatedAt).toLocaleDateString()}</span>
                </div>

                <div class="exegesis-section">
                    <h6>📜 ${isId ? 'Konteks Historis' : 'Historical Context'}</h6>
                    <p>${data.context}</p>
                </div>

                <div class="exegesis-section original-language-section">
                    <h6>🔤 ${isId ? 'Analisis Bahasa Asli' : 'Original Language Analysis'} 
                        <span class="lang-indicator">(${data.originalLanguage?.language || 'Hebrew/Greek'})</span>
                    </h6>
                    <div class="original-words-grid">
                        ${wordsHTML}
                    </div>
                </div>

                <div class="exegesis-section">
                    <h6>💡 ${isId ? 'Tema Utama' : 'Main Themes'}</h6>
                    <ul>${themesHTML}</ul>
                </div>

                <div class="exegesis-section">
                    <h6>🔗 ${isId ? 'Referensi Silang' : 'Cross References'}</h6>
                    <div class="cross-refs-grid">
                        ${crossRefsHTML}
                    </div>
                </div>

                <div class="exegesis-section">
                    <h6>🎯 ${isId ? 'Aplikasi Praktis' : 'Practical Application'}</h6>
                    <p>${data.application}</p>
                </div>

                ${data.prayer ? `
                <div class="exegesis-section prayer-section">
                    <h6>🙏 ${isId ? 'Doa' : 'Prayer'}</h6>
                    <p class="prayer-text">${data.prayer}</p>
                </div>
                ` : ''}

                <div class="ai-actions">
                    <button class="action-btn copy-btn" onclick="AIExegesis.copyContent()">📋 ${isId ? 'Salin' : 'Copy'}</button>
                    ${navigator.share ? `<button class="action-btn share-btn" onclick="AIExegesis.shareContent()">📤 ${isId ? 'Bagikan' : 'Share'}</button>` : ''}
                    <button class="regenerate-ai-btn">🔄 ${isId ? 'Regenerate' : 'Regenerate'}</button>
                </div>
            </div>
        `;
    },

    // Fetch cross reference verse from Bible API
    async fetchCrossRefVerse(reference, container, language) {
        const isId = language === 'id';

        // Show loading
        container.innerHTML = `
            <div class="cross-ref-loading">
                <span class="mini-spinner"></span>
                ${isId ? 'Memuat ayat...' : 'Loading verse...'}
            </div>
        `;

        try {
            // Convert reference format (e.g., "Matius 19:4-6" -> API format)
            // The reference might be in format "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
            const match = reference.match(/^(.+?)\s+(\d+):(.+)$/);

            if (!match) {
                throw new Error(isId ? 'Format referensi tidak valid' : 'Invalid reference format');
            }

            const bookName = match[1];
            const chapter = match[2];
            const verses = match[3];

            if (!window.BibleAPI) {
                throw new Error(isId ? 'Bible API tidak tersedia' : 'Bible API not available');
            }

            let data, translation;

            if (isId) {
                // Use Indonesian AYT API
                const bookAbbr = window.BibleAPI.BOOK_ABBR_MAP[bookName];
                if (!bookAbbr) {
                    throw new Error(isId ? 'Kitab tidak ditemukan' : 'Book not found');
                }

                const url = `https://api.ayt.co/v1/bible.php?book=${bookAbbr}&chapter=${chapter}&source=bible365app`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const aytData = await response.json();
                const bookData = Object.values(aytData)[0];
                if (!bookData || !bookData.data) throw new Error('Invalid response');

                const chapterData = bookData.data[chapter];
                if (!chapterData) throw new Error('Chapter not found');

                // Parse verse range (e.g., "4-6" or "4")
                const verseRange = verses.split('-').map(v => parseInt(v.trim()));
                const startVerse = verseRange[0];
                const endVerse = verseRange[1] || startVerse;

                // Filter verses in range
                const filteredVerses = Object.values(chapterData)
                    .filter(v => {
                        const vNum = parseInt(v.verse);
                        return vNum >= startVerse && vNum <= endVerse;
                    })
                    .map(v => ({ verse: parseInt(v.verse), text: v.text }));

                data = { verses: filteredVerses };
                translation = 'Alkitab Yang Terbuka (AYT)';
            } else {
                // Use English bible-api.com
                const bookEn = window.BibleAPI.BOOK_NAME_MAP[bookName] || bookName;
                const apiRef = `${bookEn} ${chapter}:${verses}`;

                const response = await fetch(`https://bible-api.com/${encodeURIComponent(apiRef)}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                data = await response.json();
                translation = data.translation_name || 'World English Bible';
            }

            if (data.verses && data.verses.length > 0) {
                let verseHtml = data.verses.map(v =>
                    `<span class="verse-number">${v.verse}</span>${v.text.trim()} `
                ).join('');

                container.innerHTML = `
                    <div class="cross-ref-verse-content">
                        <div class="verse-translation">${translation}</div>
                        <p class="verse-text">${verseHtml}</p>
                    </div>
                `;
                container.classList.add('loaded');
            } else {
                throw new Error(isId ? 'Ayat tidak ditemukan' : 'Verse not found');
            }
        } catch (error) {
            console.error('Error fetching cross reference:', error);
            container.innerHTML = `
                <div class="cross-ref-error">
                    ⚠️ ${error.message || (isId ? 'Gagal memuat ayat' : 'Failed to load verse')}
                </div>
            `;
        }
    },
    // Copy content to clipboard
    copyContent() {
        const root = document.querySelector('.ai-exegesis-result');
        if (!root) return;

        let text = `*Bible 365 Exegesis*\nGenerated ${new Date().toLocaleDateString()}\n\n`;

        // Iterate over all sections
        const sections = root.querySelectorAll('.exegesis-section');
        sections.forEach(section => {
            // Header
            const header = section.querySelector('h6')?.textContent?.trim();
            if (header) text += `\n${header}\n${'-'.repeat(header.length)}\n`;

            // Original Language Cards
            const cards = section.querySelectorAll('.original-word-card');
            if (cards.length > 0) {
                cards.forEach(card => {
                    const original = card.querySelector('.original-script')?.textContent;
                    const translit = card.querySelector('.transliteration')?.textContent;
                    const meaning = card.querySelector('.word-meaning')?.textContent;
                    text += `- ${original} ${translit}: ${meaning}\n`;
                });
                return; // Continue to next section logic handled by paragraphs below? 
                // Using return here means we skip other content in this section. 
                // Original code structure has dedicated sections.
            }

            // Lists (Themes)
            const listItems = section.querySelectorAll('li');
            if (listItems.length > 0) {
                listItems.forEach(li => text += `• ${li.textContent.trim()}\n`);
                return;
            }

            // Cross References
            const crossRefs = section.querySelectorAll('.cross-ref-item');
            if (crossRefs.length > 0) {
                crossRefs.forEach(ref => {
                    const refHeader = ref.querySelector('strong')?.textContent;
                    const conn = ref.querySelector('.cross-ref-connection')?.textContent;
                    text += `> ${refHeader} - ${conn}\n`;
                });
                return;
            }

            // Paragraphs (Context, Application, Prayer)
            // Only convert paragraphs if we haven't handled special types above
            // Or better: capture all Ps that are direct children or specific classes
            const paras = section.querySelectorAll('p');
            paras.forEach(p => {
                // Skip if inside card or cross-ref
                if (!p.closest('.original-word-card') && !p.closest('.cross-ref-item')) {
                    text += `${p.textContent.trim()}\n`;
                }
            });
        });

        text += `\n_Generated by Bible 365 App_`;

        navigator.clipboard.writeText(text).then(() => {
            // Use simple alert or custom UI
            const btn = root.querySelector('.copy-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => btn.innerHTML = originalText, 2000);
        }).catch(err => console.error('Copy failed:', err));
    },

    // Share content
    async shareContent() {
        // Construct the same text or simpler
        const text = `Check out this Bible exegesis from Bible 365 app!`; // Simplified

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Bible 365 Exegesis',
                    text: text,
                    // url: window.location.href // Optional
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        }
    }
};

// Make available globally
window.AIExegesis = AIExegesis;
