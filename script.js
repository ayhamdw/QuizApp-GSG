import questions from "./data.js";
class LocalStorage {
    constructor(key = 'quiz_answers') {
        this.storageKey = key;
    }
    save(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    load() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }
    clear() {
        localStorage.removeItem(this.storageKey);
    }
}
class Quiz {
    constructor(questions) {
        this.questions = questions;
        this.answers = {};
        this.score = 0;
        this.storage = new LocalStorage();
        this.loadAnswers();
    }
    calculateScore() {
        this.score = 0;
        this.questions.forEach((q, index) => {
            if (this.answers[`question${index}`] === q.answer) {
                this.score++;
            }
        });
        return this.score;
    }
    getPercentage() {
        return Math.round((this.score / this.questions.length) * 100);
    }
    isPassed() {
        return this.getPercentage() >= 70;
    }
    reset() {
        this.answers = {};
        this.score = 0;
        this.storage.clear();
    }
    setAnswer(questionIndex, answer) {
        this.answers[`question${questionIndex}`] = answer;
        this.storage.save(this.answers);
    }
    loadAnswers() {
        this.answers = this.storage.load();
    }
}
class QuizUI {
    constructor(quiz) {
        this.quiz = quiz;
        this.container = document.getElementById('quiz-container');
        this.resultContainer = document.getElementById('result-container');
    }
    render() {
        this.container.innerHTML = '';
        
        this.quiz.questions.forEach((q, index) => {
            const questionDiv = this.createQuestionElement(q, index);
            this.container.appendChild(questionDiv);
        });

        this.attachEventListeners();
    }
    createQuestionElement(question, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question'; 
        questionDiv.innerHTML = `
            <div class="question-text">${question.question}</div>
            <div class="options">
                ${question.options.map(option => `
                    <div class="option">
                        <input type="radio" id="q${index}_${option.id}" name="question${index}" value="${option.id}" 
                               ${this.quiz.answers[`question${index}`] === option.id ? 'checked' : ''}>
                        <label for="q${index}_${option.id}">${option.id}. ${option.text}</label>
                    </div>
                `).join('')}
            </div>
        `;

        return questionDiv;
    }
    attachEventListeners() {
        this.quiz.questions.forEach((_, index) => {
            const inputs = document.querySelectorAll(`input[name="question${index}"]`);
            inputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    this.quiz.setAnswer(index, e.target.value);
                });
            });
        });
    }
    showResults() {
        const score = this.quiz.calculateScore();
        const percentage = this.quiz.getPercentage();
        const passed = this.quiz.isPassed();

        this.resultContainer.innerHTML = `
            <div class="result ${passed ? 'pass' : 'fail'}">
                <h3>Quiz Results</h3>
                <p>Score: ${score}/${this.quiz.questions.length} (${percentage}%)</p>
                <p>${passed ? 'Congratulations! You Passed!' : 'Sorry, you need 70% to pass. Try again!'}</p>
            </div>
        `;

        this.disableInputs();
    }
    disableInputs() {
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.disabled = true;
        });
    }
    reset() {
        this.quiz.reset();
        this.resultContainer.innerHTML = '';
        this.render();
    }
}
class QuizApp {
    constructor() {
        this.quiz = new Quiz(questions);
        this.ui = new QuizUI(this.quiz);
        this.init();
    }
    init() {
        this.ui.render();
        this.attachButtonEvents();
    }
    attachButtonEvents() {
        const submitBtn = document.querySelector('.submit-btn');
        const resetBtn = document.querySelector('.reset-btn');

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
        }
    }
    handleSubmit() {
        this.ui.showResults();
    }
    handleReset() {
        this.ui.reset();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});