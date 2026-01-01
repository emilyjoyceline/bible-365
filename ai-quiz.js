/**
 * Bible 365 - AI Quiz Module
 * Uses Google Gemini API to generate quizzes based on daily readings.
 * Uses robust text parsing to avoid JSON errors.
 */

const AIQuiz = {
    state: {
        questions: [],
        currentIndex: 0,
        score: 0,
        userAnswers: [],
        isQuizActive: false
    },

    // Get system prompt for quiz generation
    getSystemPrompt(language) {
        const isId = language === 'id';
        const langName = isId ? 'Indonesian' : 'English';

        return `You are a Bible Quiz Generator.
Task: Generate a multiple-choice quiz based on the provided Bible passages.
Language: ${langName}.
Difficulty: Mixed (Easy to Medium).
Number of Questions: 5.

Response Format: PLAIN TEXT (Structured).
Separate each question with "---".
Use the following exact format for each question:

Question: [Your question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [Letter A, B, C, or D]
Explanation: [Brief explanation]

Example:
Question: Who built the ark?
A) Moses
B) Noah
C) David
D) Jesus
Correct: B
Explanation: Only Noah was commanded to build the ark.
---
Question: Next question?
...
`;
    },

    async generateQuizData(readings, language) {
        const url = `${geminiConfig.apiUrl}?key=${geminiConfig.apiKey}`;
        const systemPrompt = this.getSystemPrompt(language);

        const userMessage = `Reading passages: ${readings.join(', ')}. Generate 5 questions.`;

        const requestBody = {
            contents: [{
                role: "user",
                parts: [{ text: systemPrompt + "\n\n" + userMessage }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                responseMimeType: "text/plain"
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error('No content generated');

            return this.parseQuizText(text);

        } catch (error) {
            console.error('Quiz Generation Error:', error);
            throw error;
        }
    },

    parseQuizText(text) {
        const questions = [];
        const blocks = text.split('---');

        for (const block of blocks) {
            const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length < 5) continue;

            const q = { options: [] };
            let currentOption = null;

            for (const line of lines) {
                if (line.startsWith('Question:')) {
                    q.question = line.replace('Question:', '').trim();
                } else if (line.match(/^[A-D]\)/)) {
                    q.options.push(line.replace(/^[A-D]\)/, '').trim());
                } else if (line.startsWith('Correct:')) {
                    const letter = line.replace('Correct:', '').trim().toUpperCase();
                    // Map letter to index
                    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
                    q.correctIndex = map[letter.charAt(0)] ?? 0;
                } else if (line.startsWith('Explanation:')) {
                    q.explanation = line.replace('Explanation:', '').trim();
                }
            }

            if (q.question && q.options.length === 4) {
                questions.push(q);
            }
        }

        return questions;
    },

    // Initialize/Start a quiz
    async startQuiz(day, readings, container, language) {
        this.container = container;
        this.language = language;
        this.day = day;

        // Render Loading State
        this.renderLoading();

        try {
            const questions = await this.generateQuizData(readings, language);
            if (questions.length === 0) throw new Error('No valid questions parsed');

            this.state.questions = questions;
            this.state.currentIndex = 0;
            this.state.score = 0;
            this.state.userAnswers = new Array(questions.length).fill(null);
            this.state.isQuizActive = true;

            this.renderQuestion();
        } catch (error) {
            this.renderError(error);
        }
    },

    renderLoading() {
        const isId = this.language === 'id';
        const dayText = this.day ? (isId ? `Hari ${this.day}` : `Day ${this.day}`) : (isId ? 'Hari Ini' : 'Today');

        this.container.innerHTML = `
            <div class="quiz-loading">
                <div class="loading-spinner"></div>
                <p>${isId ? `Sedang membuat kuis dari bacaan ${dayText}...` : `Generating quiz from ${dayText}'s readings...`}</p>
                <small>AI sedang membaca dan menyusun pertanyaan.</small>
            </div>
        `;
    },

    renderError(error) {
        const isId = this.language === 'id';
        this.container.innerHTML = `
            <div class="quiz-error">
                <p>⚠️ ${isId ? 'Gagal membuat kuis.' : 'Failed to generate quiz.'}</p>
                <div style="font-size:0.8rem; color:var(--color-text-tertiary); margin-bottom:1rem;">${error.message || ''}</div>
                <button onclick="AIQuiz.retry()" class="retry-btn">${isId ? 'Coba Lagi' : 'Try Again'}</button>
            </div>
        `;
    },

    retry() {
        // Simple reload logic could be implemented here
    },

    renderQuestion() {
        const q = this.state.questions[this.state.currentIndex];
        const index = this.state.currentIndex;
        const total = this.state.questions.length;
        const isId = this.language === 'id';

        this.container.innerHTML = `
            <div class="quiz-question-card">
                <div class="quiz-progress-text">
                    ${isId ? 'Pertanyaan' : 'Question'} ${index + 1} / ${total}
                </div>
                <h3 class="quiz-question-text">${q.question}</h3>
                
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option-btn" onclick="AIQuiz.handleAnswer(${i})">
                            <span class="option-label">${['A', 'B', 'C', 'D'][i]}</span>
                            <span class="option-text">${opt}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    handleAnswer(selectedIndex) {
        if (!this.state.isQuizActive) return;

        const q = this.state.questions[this.state.currentIndex];
        const isCorrect = selectedIndex === q.correctIndex;

        // Record answer
        this.state.userAnswers[this.state.currentIndex] = selectedIndex;
        if (isCorrect) this.state.score++;

        this.showFeedback(selectedIndex, q.correctIndex, q.explanation);
    },

    showFeedback(selectedIndex, correctIndex, explanation) {
        const opts = this.container.querySelectorAll('.quiz-option-btn');
        const isId = this.language === 'id';

        opts.forEach((btn, i) => {
            btn.disabled = true; // Disable all
            if (i === correctIndex) btn.classList.add('correct');
            if (i === selectedIndex && i !== correctIndex) btn.classList.add('wrong');
        });

        // Add feedback section
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'quiz-feedback';
        feedbackDiv.innerHTML = `
            <div class="feedback-content">
                <strong>${selectedIndex === correctIndex ? (isId ? '✅ Benar!' : '✅ Correct!') : (isId ? '❌ Salah' : '❌ Wrong')}</strong>
                <p>${explanation}</p>
            </div>
            <button class="next-question-btn" onclick="AIQuiz.nextQuestion()">
                ${this.state.currentIndex < this.state.questions.length - 1 ? (isId ? 'Lanjut' : 'Next') : (isId ? 'Lihat Hasil' : 'See Results')}
            </button>
        `;

        this.container.querySelector('.quiz-question-card').appendChild(feedbackDiv);

        // Auto-scroll to feedback
        setTimeout(() => {
            feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    },

    nextQuestion() {
        if (this.state.currentIndex < this.state.questions.length - 1) {
            this.state.currentIndex++;
            this.renderQuestion();
        } else {
            this.showResults();
        }
    },

    showResults() {
        const score = this.state.score;
        const total = this.state.questions.length;
        const percentage = Math.round((score / total) * 100);
        const isId = this.language === 'id';

        let message = '';
        if (percentage === 100) message = isId ? 'Sempurna! Luar biasa!' : 'Perfect! Amazing!';
        else if (percentage >= 80) message = isId ? 'Sangat bagus!' : 'Great job!';
        else if (percentage >= 60) message = isId ? 'Cukup baik.' : 'Good effort.';
        else message = isId ? 'Perlu belajar lagi.' : 'Keep studying.';

        this.container.innerHTML = `
            <div class="quiz-results">
                <div class="score-circle">
                    <span class="score-number">${score}/${total}</span>
                    <span class="score-label">Score</span>
                </div>
                <h2>${message}</h2>
                <div class="result-actions">
                    <button class="close-quiz-btn" onclick="document.getElementById('quiz-modal').classList.remove('active')">
                        ${isId ? 'Tutup' : 'Close'}
                    </button>
                </div>
            </div>
        `;
    }
};
