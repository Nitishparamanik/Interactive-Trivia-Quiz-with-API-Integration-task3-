// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const loadingScreen = document.getElementById('loading-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const categoryBtns = document.querySelectorAll('.category-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const homeBtn = document.getElementById('home-btn');

const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');
const scoreEl = document.getElementById('score');
const questionCategoryEl = document.getElementById('question-category');
const questionDifficultyEl = document.getElementById('question-difficulty');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const progressFillEl = document.querySelector('.progress-fill');

const finalScoreEl = document.getElementById('final-score');
const finalTotalEl = document.getElementById('final-total');
const scoreMessageEl = document.getElementById('score-message');
const correctAnswersEl = document.getElementById('correct-answers');
const incorrectAnswersEl = document.getElementById('incorrect-answers');
const timeTakenEl = document.getElementById('time-taken');

// Quiz State
let quizState = {
    category: '9', // Default: General Knowledge
    difficulty: 'medium', // Default: Medium
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    selectedOption: null,
    startTime: null,
    endTime: null
};

// Initialize
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Default selection for category and difficulty
    document.querySelector('.category-btn[data-id="9"]').classList.add('selected');
    document.querySelector('.difficulty-btn[data-difficulty="medium"]').classList.add('selected');
}

function setupEventListeners() {
    // Category buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove 'selected' class from all category buttons
            categoryBtns.forEach(b => b.classList.remove('selected'));
            // Add 'selected' class to clicked button
            btn.classList.add('selected');
            // Update quiz state
            quizState.category = btn.getAttribute('data-id');
        });
    });

    // Difficulty buttons
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove 'selected' class from all difficulty buttons
            difficultyBtns.forEach(b => b.classList.remove('selected'));
            // Add 'selected' class to clicked button
            btn.classList.add('selected');
            // Update quiz state
            quizState.difficulty = btn.getAttribute('data-difficulty');
        });
    });

    // Start button
    startBtn.addEventListener('click', startQuiz);

    // Next button
    nextBtn.addEventListener('click', nextQuestion);

    // Play Again button
    playAgainBtn.addEventListener('click', () => {
        // Reset quiz state
        resetQuiz();
        // Show welcome screen
        showScreen(welcomeScreen);
    });

    // Home button
    homeBtn.addEventListener('click', () => {
        // Reset quiz state
        resetQuiz();
        // Show welcome screen
        showScreen(welcomeScreen);
    });
}

// Show screen function
function showScreen(screen) {
    // Hide all screens
    [welcomeScreen, loadingScreen, quizScreen, resultsScreen].forEach(s => {
        s.classList.remove('active');
    });
    // Show the specified screen
    screen.classList.add('active');
}

// Start quiz
async function startQuiz() {
    // Record start time
    quizState.startTime = new Date();
    
    // Show loading screen
    showScreen(loadingScreen);
    
    try {
        // Fetch questions from API
        await fetchQuestions();
        
        // Set up first question
        setupQuestion();
        
        // Show quiz screen
        showScreen(quizScreen);
    } catch (error) {
        console.error("Error starting quiz:", error);
        alert("Failed to load quiz questions. Please try again.");
        showScreen(welcomeScreen);
    }
}

// Fetch questions from API
async function fetchQuestions() {
    const url = `https://opentdb.com/api.php?amount=10&category=${quizState.category}&difficulty=${quizState.difficulty}&type=multiple`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.response_code !== 0) {
            throw new Error("Failed to load questions");
        }
        
        quizState.questions = data.results;
        quizState.currentQuestionIndex = 0;
        quizState.score = 0;
    } catch (error) {
        console.error("Error fetching questions:", error);
        throw error;
    }
}

// Setup question
function setupQuestion() {
    const question = quizState.questions[quizState.currentQuestionIndex];
    
    // Reset state
    quizState.selectedOption = null;
    nextBtn.disabled = true;
    
    // Update question metadata
    currentQuestionEl.textContent = quizState.currentQuestionIndex + 1;
    totalQuestionsEl.textContent = quizState.questions.length;
    questionCategoryEl.textContent = `Category: ${question.category}`;
    questionDifficultyEl.textContent = `Difficulty: ${capitalizeFirstLetter(question.difficulty)}`;
    
    // Update progress bar
    const progressPercentage = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
    progressFillEl.style.width = `${progressPercentage}%`;
    
    // Update question text
    questionTextEl.innerHTML = decodeHTMLEntities(question.question);
    
    // Create options
    const options = [...question.incorrect_answers, question.correct_answer];
    // Shuffle options
    shuffleArray(options);
    
    // Clear options container
    optionsContainerEl.innerHTML = '';
    
    // Add options to container
    options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.classList.add('option');
        optionEl.dataset.value = option;
        optionEl.innerHTML = decodeHTMLEntities(option);
        
        // Add event listener
        optionEl.addEventListener('click', () => selectOption(optionEl, option, question.correct_answer));
        
        optionsContainerEl.appendChild(optionEl);
    });
}

// Select option
function selectOption(optionEl, selectedOption, correctAnswer) {
    // If an option is already selected, return
    if (quizState.selectedOption !== null) return;
    
    // Set selected option
    quizState.selectedOption = selectedOption;
    
    // Add selected class
    optionEl.classList.add('selected');
    
    // Check if answer is correct
    const isCorrect = selectedOption === correctAnswer;
    
    // Update score
    if (isCorrect) {
        quizState.score++;
        scoreEl.textContent = quizState.score;
    }
    
    // Show correct/incorrect feedback after a short delay
    setTimeout(() => {
        // Remove selected class
        optionEl.classList.remove('selected');
        
        // Add correct/incorrect class
        if (isCorrect) {
            optionEl.classList.add('correct');
        } else {
            optionEl.classList.add('incorrect');
            
            // Highlight correct answer
            const options = optionsContainerEl.querySelectorAll('.option');
            options.forEach(opt => {
                if (opt.dataset.value === correctAnswer) {
                    opt.classList.add('correct');
                }
            });
        }
        
        // Enable next button
        nextBtn.disabled = false;
    }, 500);
}

// Next question
function nextQuestion() {
    // Increment question index
    quizState.currentQuestionIndex++;
    
    // Check if quiz is complete
    if (quizState.currentQuestionIndex >= quizState.questions.length) {
        endQuiz();
        return;
    }
    
    // Setup next question
    setupQuestion();
}

// End quiz
function endQuiz() {
    // Record end time
    quizState.endTime = new Date();
    
    // Calculate time taken
    const timeTaken = Math.floor((quizState.endTime - quizState.startTime) / 1000); // in seconds
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    
    // Update results screen
    finalScoreEl.textContent = quizState.score;
    finalTotalEl.textContent = quizState.questions.length;
    correctAnswersEl.textContent = quizState.score;
    incorrectAnswersEl.textContent = quizState.questions.length - quizState.score;
    timeTakenEl.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    
    // Set score message based on performance
    const scorePercentage = (quizState.score / quizState.questions.length) * 100;
    let scoreMessage = '';
    
    if (scorePercentage >= 90) {
        scoreMessage = 'Outstanding! You\'re a trivia master!';
    } else if (scorePercentage >= 70) {
        scoreMessage = 'Great job! You know your stuff!';
    } else if (scorePercentage >= 50) {
        scoreMessage = 'Good effort! Keep learning!';
    } else {
        scoreMessage = 'Nice try! Practice makes perfect!';
    }
    
    scoreMessageEl.textContent = scoreMessage;
    
    // Show results screen
    showScreen(resultsScreen);
}

// Reset quiz
function resetQuiz() {
    quizState = {
        category: quizState.category, // Preserve selected category
        difficulty: quizState.difficulty, // Preserve selected difficulty
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        selectedOption: null,
        startTime: null,
        endTime: null
    };
    
    // Reset UI elements
    scoreEl.textContent = '0';
    progressFillEl.style.width = '10%';
}

// Helper Functions

// Decode HTML entities
function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize quiz
document.addEventListener('DOMContentLoaded', init);