// DOM Elements
const fileSelector = document.getElementById('file-selector');
const refreshBtn = document.getElementById('refresh-files');
const readBtn = document.getElementById('read-btn');
const saveBtn = document.getElementById('save-btn');
const newBtn = document.getElementById('new-btn');
const textEditor = document.getElementById('text-editor');
const lineNumbers = document.querySelector('.line-numbers');
const statusBar = document.getElementById('status-bar');
const themeToggle = document.getElementById('theme-toggle');

// State
let currentFile = '';
let isDarkMode = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFileList();
    setupEventListeners();
    updateLineNumbers();
});

// Event Listeners
function setupEventListeners() {
    // File operations
    refreshBtn.addEventListener('click', loadFileList);
    readBtn.addEventListener('click', readFile);
    saveBtn.addEventListener('click', saveFile);
    newBtn.addEventListener('click', createNewFile);
    fileSelector.addEventListener('change', handleFileSelect);
    
    // Editor features
    textEditor.addEventListener('input', updateLineNumbers);
    textEditor.addEventListener('scroll', syncScroll);
    themeToggle.addEventListener('click', toggleTheme);
}

// File Operations
async function loadFileList() {
    try {
        const response = await fetch('/files');
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        updateFileSelector(files);
        showStatus('Files loaded successfully');
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

async function readFile() {
    if (!currentFile) {
        showStatus('No file selected', 'error');
        return;
    }

    try {
        const response = await fetch(`/file/${currentFile}`);
        if (!response.ok) throw new Error('Failed to read file');
        
        const content = await response.text();
        textEditor.value = content;
        updateLineNumbers();
        showStatus(`Loaded: ${currentFile}`);
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

async function saveFile() {
    if (!currentFile) {
        showStatus('No file selected', 'error');
        return;
    }

    try {
        const response = await fetch(`/file/${currentFile}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: textEditor.value })
        });
        
        if (!response.ok) throw new Error('Failed to save file');
        showStatus(`Saved: ${currentFile}`);
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

// UI Helpers
function updateFileSelector(files) {
    fileSelector.innerHTML = '<option value="">Select a file</option>';
    files.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        fileSelector.appendChild(option);
    });
}

function handleFileSelect(e) {
    currentFile = e.target.value;
    if (currentFile) readFile();
}

function updateLineNumbers() {
    const lines = textEditor.value.split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
}

function syncScroll() {
    lineNumbers.scrollTop = textEditor.scrollTop;
}

function showStatus(message, type = 'info') {
    statusBar.textContent = message;
    statusBar.className = `status-bar ${type}`;
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggle.textContent = isDarkMode ? '🌞' : '🌓';
}

// New File Creation
function createNewFile() {
    const fileName = prompt('Enter new file name:');
    if (fileName) {
        currentFile = fileName;
        textEditor.value = '';
        updateLineNumbers();
        showStatus(`New file: ${fileName}`);
        // Add to selector if not already present
        if (!Array.from(fileSelector.options).some(opt => opt.value === fileName)) {
            const option = document.createElement('option');
            option.value = fileName;
            option.textContent = fileName;
            fileSelector.appendChild(option);
        }
        fileSelector.value = fileName;
    }
}