from flask import Flask, request, jsonify, send_file, render_template_string
from flask_cors import CORS
from TTS.api import TTS
import io
import base64
import torch
import sys
import tempfile
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# model_name = "tts_models/en/ljspeech/vits"
# model_name = "tts_models/en/ljspeech/glow-tts"
model_name = "tts_models/en/vctk/vits" 
default_port = 5080

# Get port from command line argument or use default
if len(sys.argv) > 1:
    try:
        port = int(sys.argv[1])
        print(f"Using port from command line: {port}")
    except ValueError:
        print(f"Invalid port argument '{sys.argv[1]}'. Using default port 5080.")
        port = default_port
else:
    port = default_port
    print(f"No port specified. Using default port: {port}")

# Initialize TTS model globally to avoid re-loading on each request
# You can choose a different model if you prefer.
# This model will be downloaded the first time it's used.
print("Loading Coqui TTS model... This may take a while.")
# check if gpu is available and load the model accordingly
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print (f"Using device: {device}")
try:
    # Using a common English VITS model
    tts = TTS(model_name=model_name, progress_bar=True)
    tts.to(device)  # Move model to the appropriate device
    print("Coqui TTS model loaded successfully.")
    
    # Print available speakers if multi-speaker model
    if hasattr(tts, 'speakers') and tts.speakers:
        print(f"Available speakers: {len(tts.speakers)}")
        print("Sample speakers:", tts.speakers[:10])
    
except Exception as e:
    print(f"Error loading Coqui TTS model: {e}")
    print("Attempting to load without GPU (if GPU failed or not available).")
    try:
        tts = TTS(model_name=model_name, progress_bar=True)
        tts.to('cpu')  # Ensure the model is loaded on CPU
        print("Coqui TTS model loaded successfully (CPU mode).")
        
        # Print available speakers if multi-speaker model
        if hasattr(tts, 'speakers') and tts.speakers:
            print(f"Available speakers: {len(tts.speakers)}")
            print("Sample speakers:", tts.speakers[:10])
            
    except Exception as e_cpu:
        print(f"Critical error: Could not load Coqui TTS model even in CPU mode: {e_cpu}")
        tts = None # Indicate that TTS is not available

# HTML template as a variable
HTML_TEMPLATE = """
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TTS Reader (Coqui AI Backend)</title>
        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="icon.ico">
        <!-- Font Awesome CDN for icons -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <!-- Tailwind CSS CDN -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            // Always apply dark mode
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            localStorage.theme = 'dark'; // Persist dark mode preference
        </script>
        <!-- PDF.js CDN -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script>
            // Set the worker source for PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        </script>
        <!-- Tesseract.js CDN -->
        <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
        <!-- Marked.js for Markdown parsing -->
        <script src="https://cdn.jsdelivr.net/npm/marked@9.1.2/marked.min.js"></script>
        <style>
            /* Base styles for light mode (will be overridden by dark mode) */
            body {
                font-family: sans-serif;
                background-color: #f0f2f5;
                color: #333;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding-bottom: 100px; /* Add padding to the bottom of the body to prevent content from being hidden by the fixed footer */
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            .container {
                background-color: #fff;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                transition: background-color 0.3s ease, box-shadow 0.3s ease;
            }
            .highlighted {
                background-color: #d1fae5; /* Tailwind green-100 */
                border-radius: 4px;
                padding: 2px 4px;
                transition: background-color 0.3s ease;
            }
            .sentences-container span:hover {
                background-color: #e0f2f7; /* Light blue on hover */
                cursor: pointer;
            }
            .controls {
                position: fixed; /* Make the controls fixed */
                bottom: 0; /* Position at the bottom */
                left: 0; /* Align to the left */
                width: 100%; /* Take full width */
                background-color: #ffffff;
                box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
                transition: background-color 0.3s ease, box-shadow 0.3s ease;
                display: flex; /* Use flexbox */
                flex-wrap: wrap; /* Allow wrapping */
                justify-content: center; /* Center content */
                align-items: center; /* Center items vertically */
                gap: 1rem; /* Gap between items */
                border-top: 1px solid #e5e7eb; /* Light border at the top */
                padding: 1rem; /* Padding inside the footer */
            }
            .controls .button-group {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 1rem;
            }
            .controls button {
                @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 ease-in-out;
            }
            .controls button:disabled {
                @apply bg-gray-400 cursor-not-allowed;
            }
            /* Adjust button padding for icons */
            .controls button i {
                font-size: 1.25rem; /* Adjust icon size */
            }
            .controls button.icon-btn {
                padding: 0.75rem 1rem; /* Adjust padding for icon-only buttons */
            }
            #status {
                @apply text-sm text-gray-600 mt-4 text-center;
            }
            .content-area {
                @apply flex flex-col md:flex-row gap-6 mt-8;
            }
            /* Removed .content-area.force-flex-row as toggle is removed */
            .content-panel {
                @apply flex-1 border border-gray-200 p-5 rounded-lg bg-gray-50;
            }
            #text-output .content-panel {
                @apply text-lg leading-relaxed;
                max-height: 600px; /* Adjusted max-height for side-by-side */
                overflow-y: auto;
            }
            canvas {
                border: 1px solid #eee;
                margin-bottom: 10px;
                display: block;
                max-width: 100%;
                height: auto;
                border-radius: 4px;
            }
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type="number"] {
                -moz-appearance: textfield;
            }

            /* Dark mode styles */
            html.dark body {
                background-color: #1a202c;
                color: #e2e8f0;
            }
            html.dark .container {
                background-color: #2d3748;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            }
            html.dark .highlighted {
                background-color: #4a5568; /* Darker green for dark mode */
            }
            html.dark .sentences-container span:hover {
                background-color: #2c5282; /* Darker blue on hover for dark mode */
            }
            html.dark .controls {
                background-color: #2d3748;
                box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.3);
                border-top-color: #4a5568;
            }
            html.dark .controls button {
                @apply bg-blue-700 hover:bg-blue-800;
            }
            html.dark .controls button:disabled {
                @apply bg-gray-700;
            }
            html.dark #download-full-btn {
                @apply bg-green-700 hover:bg-green-800;
            }
            html.dark #download-full-btn:disabled {
                @apply bg-gray-700;
            }
            html.dark #status {
                @apply text-gray-400;
                background-color: #2d3748;
                border-color: #4a5568;
            }
            html.dark .content-panel {
                background-color: #2d3748;
                border-color: #4a5568;
            }
            html.dark canvas {
                border-color: #4a5568;
            }
            html.dark .mb-6 label {
                @apply text-blue-300;
            }
            html.dark .mb-6 input[type="file"] {
                @apply text-gray-300;
            }
            html.dark .mb-6 input[type="file"]::file-selector-button {
                @apply bg-blue-700 text-blue-100 hover:bg-blue-800;
            }
            html.dark .text-gray-700 {
                @apply text-gray-300;
            }
            html.dark .text-gray-800 {
                @apply text-gray-200;
            }
            html.dark .border-blue-200 {
                border-color: #4299e1;
            }
            html.dark .bg-blue-50 {
                background-color: #2a4365;
            }

            /* Markdown content styling */
            .markdown-content {
                line-height: 1.6;
            }
            .markdown-content h1, .markdown-content h2, .markdown-content h3, 
            .markdown-content h4, .markdown-content h5, .markdown-content h6 {
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                font-weight: bold;
                color: #2d3748;
            }
            .markdown-content h1 { font-size: 2rem; }
            .markdown-content h2 { font-size: 1.75rem; }
            .markdown-content h3 { font-size: 1.5rem; }
            .markdown-content h4 { font-size: 1.25rem; }
            .markdown-content h5 { font-size: 1.125rem; }
            .markdown-content h6 { font-size: 1rem; }
            .markdown-content p {
                margin-bottom: 1rem;
            }
            .markdown-content ul, .markdown-content ol {
                margin-bottom: 1rem;
                padding-left: 2rem;
            }
            .markdown-content li {
                margin-bottom: 0.5rem;
            }
            .markdown-content blockquote {
                border-left: 4px solid #e2e8f0;
                padding-left: 1rem;
                margin: 1rem 0;
                font-style: italic;
                color: #4a5568;
            }
            .markdown-content code {
                background-color: #f7fafc;
                padding: 0.25rem 0.5rem;
                border-radius: 0.375rem;
                font-family: 'Courier New', monospace;
                font-size: 0.875rem;
            }
            .markdown-content pre {
                background-color: #f7fafc;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 1rem 0;
            }
            .markdown-content pre code {
                background-color: transparent;
                padding: 0;
            }
            .markdown-content strong {
                font-weight: bold;
            }
            .markdown-content em {
                font-style: italic;
            }
            .markdown-content a {
                color: #3182ce;
                text-decoration: underline;
            }
            .markdown-content hr {
                border: none;
                border-top: 1px solid #e2e8f0;
                margin: 2rem 0;
            }
            
            /* Clickable markdown elements */
            .markdown-content .clickable-element {
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .markdown-content .clickable-element:hover {
                background-color: #e0f2f7 !important;
            }
            .markdown-content .clickable-element.highlighted {
                background-color: #d1fae5 !important;
                border-radius: 4px;
                padding: 2px 4px;
            }

            /* Dark mode styles for markdown */
            html.dark .markdown-content h1, html.dark .markdown-content h2, html.dark .markdown-content h3, 
            html.dark .markdown-content h4, html.dark .markdown-content h5, html.dark .markdown-content h6 {
                color: #e2e8f0;
            }
            html.dark .markdown-content blockquote {
                border-left-color: #4a5568;
                color: #a0aec0;
            }
            html.dark .markdown-content code {
                background-color: #2d3748;
                color: #e2e8f0;
            }
            html.dark .markdown-content pre {
                background-color: #2d3748;
            }
            html.dark .markdown-content a {
                color: #63b3ed;
            }
            html.dark .markdown-content hr {
                border-top-color: #4a5568;
            }
            
            /* Dark mode for clickable elements */
            html.dark .markdown-content .clickable-element:hover {
                background-color: #2c5282 !important;
            }
            html.dark .markdown-content .clickable-element.highlighted {
                background-color: #4a5568 !important;
            }
        </style>
    </head>
    <body>
        <div class="container max-w-1200px w-95% mx-auto p-10 rounded-xl shadow-lg my-8">
            <h1 class="text-4xl font-extrabold text-center mb-8 text-gray-800 dark:text-gray-100">TTS Reader</h1>

            <div class="mb-8 p-6 border border-blue-200 bg-blue-50 rounded-lg shadow-inner dark:border-blue-700 dark:bg-blue-900">
                <div class="mb-4">
                    <label for="pdf-file" class="block text-blue-800 text-lg font-semibold mb-3 dark:text-blue-300">Upload PDF Document:</label>
                    <input type="file" id="pdf-file" accept=".pdf" class="block w-full text-sm text-gray-700 dark:text-gray-300
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-100 file:text-blue-700
                        hover:file:bg-blue-200 cursor-pointer
                        dark:file:bg-blue-700 dark:file:text-blue-100 dark:hover:file:bg-blue-800
                    ">
                </div>
                <div class="mb-4">
                    <label for="text-file" class="block text-blue-800 text-lg font-semibold mb-3 dark:text-blue-300">Or Upload Text File:</label>
                    <input type="file" id="text-file" accept=".txt,.md,.rtf" class="block w-full text-sm text-gray-700 dark:text-gray-300
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-100 file:text-green-700
                        hover:file:bg-green-200 cursor-pointer
                        dark:file:bg-green-700 dark:file:text-green-100 dark:hover:file:bg-green-800
                    ">
                </div>
                <div>
                    <label for="text-input" class="block text-blue-800 text-lg font-semibold mb-3 dark:text-blue-300">Or Paste Text Directly:</label>
                    <textarea id="text-input" rows="6" placeholder="Paste your text here..." class="w-full p-3 border border-gray-300 rounded-md text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"></textarea>
                    <button id="process-text-btn" class="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed">Process Text</button>
                </div>
            </div>

            <div id="status" class="text-center font-medium text-gray-700 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">Initializing...</div>

            <div class="content-area flex flex-col md:flex-row gap-6 mt-8">
                <div id="pdf-viewer" class="content-panel flex-1 p-6 rounded-lg shadow-md hidden dark:bg-gray-800 dark:border-gray-700">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">PDF Page <span id="page-num"></span> of <span id="page-count"></span>:</h2>
                    <canvas id="pdf-canvas" class="border border-gray-300 rounded-md dark:border-gray-600"></canvas>
                </div>

                <div id="text-output" class="content-panel flex-1 p-6 rounded-lg shadow-md hidden dark:bg-gray-800 dark:border-gray-700">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Extracted Text:</h2>
                    <div id="sentences-container" class="sentences-container"></div>
                </div>
            </div>

            <div id="text-only-output" class="content-area hidden">
                <div class="content-panel w-full p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Text Content:</h2>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Plain</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="markdown-toggle" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Markdown</span>
                        </div>
                    </div>
                    <div id="text-sentences-container" class="sentences-container text-lg leading-relaxed max-h-600 overflow-y-auto"></div>
                    <div id="markdown-rendered-container" class="markdown-content text-lg leading-relaxed max-h-600 overflow-y-auto hidden"></div>
                </div>
            </div>

            <!-- Audio player moved to footer -->
        </div>

        <div class="controls fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg flex flex-wrap justify-center gap-4 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div class="button-group">
                <button id="prev-page-btn" disabled class="icon-btn"><i class="fas fa-chevron-left"></i></button>
                <button id="play-btn" disabled class="icon-btn"><i class="fas fa-play"></i></button>
                <button id="pause-btn" disabled class="icon-btn"><i class="fas fa-pause"></i></button>
                <button id="stop-btn" disabled class="icon-btn"><i class="fas fa-stop"></i></button>
                <button id="next-page-btn" disabled class="icon-btn"><i class="fas fa-chevron-right"></i></button>
                <button id="download-full-btn" disabled class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <i class="fas fa-download mr-2"></i>Download Full Audio
                </button>
                <div class="flex items-center space-x-3 ml-4">
                    <label for="wpm-input" class="text-gray-700 font-medium dark:text-gray-300">WPM:</label>
                    <input type="number" id="wpm-input" min="50" max="500" value="180" step="10" class="w-24 p-2 border border-gray-300 rounded-md text-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <input type="checkbox" id="ocr-toggle" class="form-checkbox h-5 w-5 text-blue-600 rounded dark:text-blue-400">
                    <label for="ocr-toggle" class="text-gray-700 font-medium dark:text-gray-300">Perform OCR</label>
                </div>
                <div class="flex items-center space-x-3 ml-4">
                    <label for="voice-select" class="text-gray-700 font-medium dark:text-gray-300">Voice:</label>
                    <select id="voice-select" class="p-2 border border-gray-300 rounded-md text-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="p270">Default (p270)</option>
                    </select>
                </div>
                <div class="flex items-center space-x-3 ml-4">
                    <span class="text-gray-700 font-medium dark:text-gray-300">Time Left:</span>
                    <span id="time-estimate" class="text-gray-600 dark:text-gray-400 min-w-20">--:--</span>
                </div>
            </div>
            <audio id="audio-player" controls class="w-1/4 mt-2"></audio>
            
            <!-- Progress bar for full document download (initially hidden) -->
            <div id="download-progress-container" class="w-full mt-4 hidden">
                <div class="flex items-center justify-between mb-2">
                    <span id="download-status-text" class="text-sm font-medium text-gray-700 dark:text-gray-300">Generating full document audio...</span>
                    <span id="download-progress-text" class="text-sm text-gray-600 dark:text-gray-400">0%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                    <div id="download-progress-bar" class="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out" style="width: 0%">
                        <!-- Progress bar shimmer effect -->
                        <div class="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <div class="flex justify-between mt-1">
                    <span id="chunk-info" class="text-xs text-gray-500 dark:text-gray-400"></span>
                    <span id="estimated-time" class="text-xs text-gray-500 dark:text-gray-400"></span>
                </div>
            </div>
        </div>

        <script>
            const pdfFile = document.getElementById('pdf-file');
            const textFile = document.getElementById('text-file');
            const textInput = document.getElementById('text-input');
            const processTextBtn = document.getElementById('process-text-btn');
            const pdfViewer = document.getElementById('pdf-viewer');
            const textOutput = document.getElementById('text-output');
            const textOnlyOutput = document.getElementById('text-only-output');
            const sentencesContainer = document.getElementById('sentences-container');
            const textSentencesContainer = document.getElementById('text-sentences-container');
            const markdownRenderedContainer = document.getElementById('markdown-rendered-container');
            const markdownToggle = document.getElementById('markdown-toggle');
            const statusDiv = document.getElementById('status');
            const playBtn = document.getElementById('play-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const stopBtn = document.getElementById('stop-btn');
            const prevPageBtn = document.getElementById('prev-page-btn');
            const nextPageBtn = document.getElementById('next-page-btn');
            const pageNumSpan = document.getElementById('page-num');
            const pageCountSpan = document.getElementById('page-count');
            const pdfCanvas = document.getElementById('pdf-canvas');
            const audioPlayer = document.getElementById('audio-player');
            const wpmInput = document.getElementById('wpm-input');
            const ocrToggle = document.getElementById('ocr-toggle');
            const voiceSelect = document.getElementById('voice-select');
            const timeEstimate = document.getElementById('time-estimate');
            const downloadFullBtn = document.getElementById('download-full-btn');
            const downloadProgressContainer = document.getElementById('download-progress-container');
            const downloadProgressBar = document.getElementById('download-progress-bar');
            const downloadProgressText = document.getElementById('download-progress-text');
            const downloadStatusText = document.getElementById('download-status-text');
            const chunkInfo = document.getElementById('chunk-info');
            const estimatedTime = document.getElementById('estimated-time');

            let tesseractWorker = null;
            let pdfDocument = null;
            let currentPageNumber = 0;
            let sentences = []; // Sentences for the currently displayed page/text
            let textSentences = []; // For text-only mode
            let originalTextContent = ''; // Store original text for markdown rendering
            let markdownElementMap = []; // Maps sentence indices to markdown elements
            let isTextMode = false; // Track if we're in text mode vs PDF mode
            // Stores OCR results for all pages: [{ pageNum: 1, sentences: [...], audioCache: [], ocrUsed: true/false }, ...]
            let ocrResults = []; // Stores OCR results for all pages: [{ pageNum: 1, sentences: [...], audioCache: [], ocrUsed: true/false }, ...]
            let textAudioCache = []; // Audio cache for text mode
            let currentSentenceIndex = 0;
            let isPlaying = false;
            let isPaused = false;
            let audioQueue = []; // Stores pre-fetched audio URLs
            let isFetchingAudio = false; // Flag to prevent multiple concurrent fetches

            const TTS_API_URL = 'http://127.0.0.1:{{ port }}/tts'; // Coqui TTS backend URL
            const FULL_DOC_TTS_API_URL = 'http://127.0.0.1:{{ port }}/full-document-tts'; // Full document TTS backend URL
            <!-- cont TTS_API_URL = '/tts'; // Coqui TTS backend URL -->
            const PREFETCH_COUNT = 2; // Number of sentences to pre-fetch
            const BASELINE_WPM = 180; // Assumed WPM for playbackRate = 1.0
            const DEFAULT_WPM = 180; // Default WPM if no saved preference

            // Initialize Tesseract.js worker
            async function initializeTesseract() {
                statusDiv.textContent = 'Initializing OCR (Tesseract.js)...';
                tesseractWorker = await Tesseract.createWorker('eng');
                statusDiv.textContent = 'OCR (Tesseract.js) ready. Please ensure the Python backend is running.';
                
                // Load available voices
                loadAvailableVoices();
            }

            // Load available voices from the backend
            async function loadAvailableVoices() {
                try {
                    const response = await fetch('http://127.0.0.1:{{ port }}/speakers');
                    const data = await response.json();
                    
                    if (data.speakers && data.speakers.length > 0) {
                        // Clear existing options
                        voiceSelect.innerHTML = '';
                        
                        // Add all available voices
                        data.speakers.forEach(speaker => {
                            const option = document.createElement('option');
                            option.value = speaker;
                            option.textContent = speaker;
                            voiceSelect.appendChild(option);
                        });
                        
                        // Set default to saved voice or p270 if available
                        const savedVoice = localStorage.getItem('savedVoice');
                        if (savedVoice && data.speakers.includes(savedVoice)) {
                            voiceSelect.value = savedVoice;
                            console.log(`Restored saved voice: ${savedVoice}`);
                        } else if (data.speakers.includes('p270')) {
                            voiceSelect.value = 'p270';
                        }
                        
                        console.log(`Loaded ${data.speakers.length} voices`);
                        
                        // Add event listener for voice changes (if not already added)
                        if (!voiceSelect.hasAttribute('data-listener-added')) {
                            voiceSelect.addEventListener('change', () => {
                                clearAllAudioCaches();
                                const selectedVoice = voiceSelect.value;
                                
                                // Save selected voice to localStorage
                                localStorage.setItem('savedVoice', selectedVoice);
                                
                                statusDiv.textContent = `Voice changed to ${selectedVoice}. Audio cache cleared.`;
                                
                                // If currently playing, stop playback since cached audio is no longer valid
                                if (isPlaying) {
                                    stopPlayback();
                                    statusDiv.textContent = `Voice changed to ${selectedVoice}. Playback stopped and audio cache cleared.`;
                                }
                            });
                            voiceSelect.setAttribute('data-listener-added', 'true');
                        }
                    }
                } catch (error) {
                    console.error('Error loading voices:', error);
                    // Keep the default option if loading fails
                }
            }

            // Clear all audio caches when voice is changed
            function clearAllAudioCaches() {
                // Clear text mode audio cache
                textAudioCache = [];
                
                // Clear PDF mode audio caches for all pages
                ocrResults.forEach(result => {
                    if (result.audioCache) {
                        // Revoke object URLs to free memory
                        result.audioCache.forEach(url => {
                            if (url) URL.revokeObjectURL(url);
                        });
                        result.audioCache = [];
                    }
                });
                
                // Clear audio queue
                audioQueue.forEach(url => {
                    if (url) URL.revokeObjectURL(url);
                });
                audioQueue = [];
                
                console.log('All audio caches cleared due to voice change');
            }

            // Calculate and update estimated time remaining
            function updateTimeEstimate() {
                if (sentences.length === 0) {
                    timeEstimate.textContent = '--:--';
                    return;
                }

                // Calculate remaining sentences
                const remainingSentences = sentences.slice(currentSentenceIndex);
                
                // Count words in remaining sentences
                let totalWords = 0;
                remainingSentences.forEach(sentence => {
                    // Simple word count: split by spaces and filter out empty strings
                    const words = sentence.trim().split(/\\s+/).filter(word => word.length > 0);
                    totalWords += words.length;
                });

                // Get current WPM setting
                const currentWPM = parseFloat(wpmInput.value) || 180;
                
                // Calculate estimated time in minutes
                const estimatedMinutes = totalWords / currentWPM;
                
                // Convert to minutes and seconds
                const minutes = Math.floor(estimatedMinutes);
                const seconds = Math.round((estimatedMinutes - minutes) * 60);
                
                // Format time display
                const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                timeEstimate.textContent = formattedTime;
            }

            // Load saved settings from localStorage
            function loadSavedSettings() {
                // Load saved WPM
                const savedWPM = localStorage.getItem('savedWPM');
                if (savedWPM) {
                    wpmInput.value = savedWPM;
                    console.log(`Restored saved WPM: ${savedWPM}`);
                } else {
                    wpmInput.value = DEFAULT_WPM;
                }
                
                // Apply initial playback rate based on WPM input value
                audioPlayer.playbackRate = parseFloat(wpmInput.value) / BASELINE_WPM;
                
                // Voice will be loaded when loadAvailableVoices() is called
            }

            // Render a specific PDF page and perform OCR if not already done
            async function renderPage(pageNum) {
                if (!pdfDocument || pageNum < 1 || pageNum > pdfDocument.numPages) {
                    return;
                }

                currentPageNumber = pageNum;
                pageNumSpan.textContent = currentPageNumber;
                pageCountSpan.textContent = pdfDocument.numPages;

                // Reset playback state for new page
                stopPlayback();
                sentencesContainer.innerHTML = '';
                sentences = [];

                // Always render the PDF page to the canvas
                statusDiv.textContent = `Rendering page ${currentPageNumber}/${pdfDocument.numPages}...`;
                const page = await pdfDocument.getPage(currentPageNumber);
                const viewport = page.getViewport({ scale: 1.5 });
                const context = pdfCanvas.getContext('2d');
                pdfCanvas.height = viewport.height;
                pdfCanvas.width = viewport.width;
                context.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height); // Clear the canvas before drawing
                await page.render({ canvasContext: context, viewport: viewport }).promise;

                // Determine if OCR should be performed for this page
                const shouldPerformOcr = ocrToggle.checked;

                // Check if OCR results for this page are already available and match the current OCR setting
                if (ocrResults[pageNum - 1] && ocrResults[pageNum - 1].sentences && ocrResults[pageNum - 1].ocrUsed === shouldPerformOcr) {
                    sentences = ocrResults[pageNum - 1].sentences;
                    statusDiv.textContent = `Page ${currentPageNumber} loaded from cache. Extracted ${sentences.length} sentences.`;
                } else {
                    let extractedText = '';
                    if (shouldPerformOcr) {
                        statusDiv.textContent = `Performing OCR on page ${currentPageNumber}/${pdfDocument.numPages}...`;
                        const { data: { text } } = await tesseractWorker.recognize(pdfCanvas);
                        extractedText = text;
                    } else {
                        statusDiv.textContent = `Extracting text from page ${currentPageNumber}/${pdfDocument.numPages} (no OCR)...`;
                        const textContent = await page.getTextContent();
                        // Join text items, adding a space between them to form a continuous string
                        extractedText = textContent.items.map(item => item.str).join(' ');
                    }

                    // Simple sentence splitting (can be improved for accuracy)
                    let pageSentences = extractedText.match(/[^.!?]+[.!?]+/g) || [];
                    if (pageSentences.length === 0 && extractedText.trim().length > 0) {
                        pageSentences = [text.trim()]; // If no punctuation, treat as one sentence
                    }
                    sentences = pageSentences.map(s => s.trim()).filter(s => s.length > 0);
                    ocrResults[pageNum - 1] = { pageNum: pageNum, sentences: sentences, audioCache: [], ocrUsed: shouldPerformOcr }; // Store results and initialize audioCache
                    statusDiv.textContent = `Page ${currentPageNumber} text processed. Extracted ${sentences.length} sentences.`;
                }

                sentences.forEach((sentence, index) => {
                    const span = document.createElement('span');
                    span.textContent = sentence + ' ';
                    span.id = `sentence-${index}`;
                    sentencesContainer.appendChild(span);
                });

                updateNavigationButtons();
                if (sentences.length > 0) {
                    playBtn.disabled = false;
                    downloadFullBtn.disabled = false; // Enable download button when content is available
                    updateTimeEstimate(); // Calculate time estimate for the page
                } else {
                    playBtn.disabled = true;
                    downloadFullBtn.disabled = true; // Disable download button when no content
                    timeEstimate.textContent = '--:--';
                }
            }

            // Perform OCR/Text Extraction for all pages in the background
            async function performBackgroundOcr() {
                if (!pdfDocument) return;

                const shouldPerformOcr = ocrToggle.checked;

                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    // Only process if not already processed or if OCR setting changed
                    if (!ocrResults[i - 1] || ocrResults[i - 1].ocrUsed !== shouldPerformOcr) {
                        statusDiv.textContent = `Background processing: Page ${i}/${pdfDocument.numPages}...`;
                        const page = await pdfDocument.getPage(i);
                        const viewport = page.getViewport({ scale: 1.0 }); // Smaller scale for faster background processing
                        const offscreenCanvas = new OffscreenCanvas(viewport.width, viewport.height);
                        const offscreenContext = offscreenCanvas.getContext('2d');

                        await page.render({ canvasContext: offscreenContext, viewport: viewport }).promise;

                        let extractedText = '';
                        if (shouldPerformOcr) {
                            const { data: { text } } = await tesseractWorker.recognize(offscreenCanvas);
                            extractedText = text;
                        } else {
                            const textContent = await page.getTextContent();
                            extractedText = textContent.items.map(item => item.str).join(' ');
                        }

                        let pageSentences = extractedText.match(/[^.!?]+[.!?]+/g) || [];
                        if (pageSentences.length === 0 && extractedText.trim().length > 0) {
                            pageSentences = [text.trim()];
                        }
                        pageSentences = pageSentences.map(s => s.trim()).filter(s => s.length > 0);

                        ocrResults[i - 1] = { pageNum: i, sentences: pageSentences, audioCache: [], ocrUsed: shouldPerformOcr };
                    }
                }
                statusDiv.textContent = `Background processing complete for all ${pdfDocument.numPages} pages.`;
            }

            // Process text content (from file upload or direct input)
            function processTextContent(text) {
                // Reset UI and state
                resetToTextMode();
                
                // Store original text for markdown rendering
                originalTextContent = text;
                
                // Simple sentence splitting (can be improved for accuracy)
                let processedSentences = text.match(/[^.!?]+[.!?]+/g) || [];
                if (processedSentences.length === 0 && text.trim().length > 0) {
                    processedSentences = [text.trim()]; // If no punctuation, treat as one sentence
                }
                textSentences = processedSentences.map(s => s.trim()).filter(s => s.length > 0);
                sentences = textSentences; // Set current sentences to text sentences
                
                // Display content based on current view mode
                updateTextDisplay();
                
                statusDiv.textContent = `Text processed. Found ${textSentences.length} sentences.`;
                
                if (textSentences.length > 0) {
                    playBtn.disabled = false;
                    downloadFullBtn.disabled = false; // Enable download button when content is available
                    updateTimeEstimate(); // Calculate time estimate for the text
                } else {
                    playBtn.disabled = true;
                    downloadFullBtn.disabled = true; // Disable download button when no content
                    timeEstimate.textContent = '--:--';
                }
            }

            // Update text display based on markdown toggle
            function updateTextDisplay() {
                if (markdownToggle.checked) {
                    // Show markdown rendered view
                    textSentencesContainer.classList.add('hidden');
                    markdownRenderedContainer.classList.remove('hidden');
                    
                    // Render markdown
                    const renderedHtml = marked.parse(originalTextContent);
                    markdownRenderedContainer.innerHTML = renderedHtml;
                    
                    // Add click handlers to rendered content for sentence navigation
                    addMarkdownClickHandlers();
                } else {
                    // Show plain text with sentence spans
                    markdownRenderedContainer.classList.add('hidden');
                    textSentencesContainer.classList.remove('hidden');
                    
                    // Display sentences as clickable spans
                    textSentencesContainer.innerHTML = '';
                    textSentences.forEach((sentence, index) => {
                        const span = document.createElement('span');
                        span.textContent = sentence + ' ';
                        span.id = `text-sentence-${index}`;
                        textSentencesContainer.appendChild(span);
                    });
                }
            }

            // Add click handlers to markdown rendered content
            function addMarkdownClickHandlers() {
                markdownElementMap = []; // Reset the mapping
                
                // Get all text-containing elements in the markdown
                const allElements = markdownRenderedContainer.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
                
                // Process each element and map it to sentences
                allElements.forEach((element, elementIndex) => {
                    // Skip code blocks and other non-clickable elements
                    if (element.closest('pre') || element.closest('code')) {
                        return;
                    }
                    
                    const elementText = element.textContent.trim();
                    if (elementText.length === 0) return;
                    
                    // Simple approach: map each element to the sentence index that best matches
                    // Find the sentence that has the most overlap with this element
                    let bestMatch = -1;
                    let bestScore = 0;
                    
                    textSentences.forEach((sentence, index) => {
                        const cleanSentence = sentence.trim().toLowerCase();
                        const cleanElementText = elementText.toLowerCase();
                        
                        // Simple substring matching
                        if (cleanElementText.includes(cleanSentence.substring(0, Math.min(50, cleanSentence.length)))) {
                            const score = cleanSentence.length;
                            if (score > bestScore) {
                                bestScore = score;
                                bestMatch = index;
                            }
                        }
                    });
                    
                    // If no good match found, use element index as fallback
                    if (bestMatch === -1 && elementIndex < textSentences.length) {
                        bestMatch = elementIndex;
                    }
                    
                    if (bestMatch >= 0 && bestMatch < textSentences.length) {
                        // Add clickable class and data attribute
                        element.classList.add('clickable-element');
                        element.dataset.sentenceIndices = JSON.stringify([bestMatch]);
                        
                        // Store mapping for highlighting
                        if (!markdownElementMap[bestMatch]) {
                            markdownElementMap[bestMatch] = [];
                        }
                        markdownElementMap[bestMatch].push(element);
                        
                        // Add click handler
                        element.addEventListener('click', (e) => {
                            e.stopPropagation();
                            playFromSentence(bestMatch);
                        });
                    }
                });
            }

            // Helper function to start playing from a specific sentence
            function playFromSentence(sentenceIndex) {
                if (sentenceIndex >= 0 && sentenceIndex < sentences.length) {
                    stopPlayback();
                    currentSentenceIndex = sentenceIndex;
                    isPlaying = true;
                    isPaused = false;
                    playBtn.disabled = false;
                    pauseBtn.disabled = false;
                    stopBtn.disabled = false;
                    audioPlayer.classList.remove('hidden');
                    updateTimeEstimate(); // Update time estimate for new position
                    readSentence();
                    preloadNextSentences();
                }
            }

            // Reset UI to text mode
            function resetToTextMode() {
                isTextMode = true;
                pdfViewer.classList.add('hidden');
                textOutput.classList.add('hidden');
                textOnlyOutput.classList.remove('hidden');
                stopPlayback();
                prevPageBtn.disabled = true;
                nextPageBtn.disabled = true;
                downloadFullBtn.disabled = true; // Disable download button until content is processed
                textAudioCache = []; // Clear text audio cache
                markdownElementMap = []; // Clear markdown element mapping
                currentSentenceIndex = 0;
                timeEstimate.textContent = '--:--'; // Reset time estimate
            }

            // Reset UI to PDF mode
            function resetToPdfMode() {
                isTextMode = false;
                textOnlyOutput.classList.add('hidden');
                pdfViewer.classList.remove('hidden');
                textOutput.classList.remove('hidden');
                stopPlayback();
                downloadFullBtn.disabled = true; // Disable download button until content is processed
                textSentences = [];
                textAudioCache = [];
                currentSentenceIndex = 0;
            }

            // Load PDF document
            pdfFile.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                // Reset UI and state
                pdfViewer.classList.add('hidden');
                textOutput.classList.add('hidden');
                playBtn.disabled = true;
                pauseBtn.disabled = true;
                stopBtn.disabled = true;
                prevPageBtn.disabled = true;
                nextPageBtn.disabled = true;
                downloadFullBtn.disabled = true; // Disable download button until content is loaded
                stopPlayback();
                pdfDocument = null;
                currentPageNumber = 0;
                ocrResults = []; // Clear previous OCR results

                statusDiv.textContent = 'Loading PDF...';
                const fileReader = new FileReader();
                fileReader.onload = async () => {
                    const typedarray = new Uint8Array(fileReader.result);
                    try {
                        pdfDocument = await pdfjsLib.getDocument(typedarray).promise;
                        pdfViewer.classList.remove('hidden');
                        textOutput.classList.remove('hidden');
                        // Show both panels when PDF is loaded
                        document.querySelector('.content-area').classList.remove('hidden'); // Use direct selector
                        renderPage(1); // Render first page immediately
                        performBackgroundOcr(); // Start background OCR for all pages
                    } catch (error) {
                        statusDiv.textContent = `Error processing PDF: ${error.message}`;
                        console.error('Error processing PDF:', error);
                    }
                };
                fileReader.readAsArrayBuffer(file);
            });

            // Text file upload handler
            textFile.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                statusDiv.textContent = 'Loading text file...';
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    const text = fileReader.result;
                    processTextContent(text);
                    // Clear PDF file input
                    pdfFile.value = '';
                };
                fileReader.readAsText(file);
            });

            // Process text button handler
            processTextBtn.addEventListener('click', () => {
                const text = textInput.value.trim();
                if (!text) {
                    statusDiv.textContent = 'Please enter some text to process.';
                    return;
                }
                processTextContent(text);
                // Clear PDF file input
                pdfFile.value = '';
            });

            // Clear text inputs when PDF is selected
            pdfFile.addEventListener('change', () => {
                textFile.value = '';
                textInput.value = '';
            });

            // Markdown toggle handler
            markdownToggle.addEventListener('change', () => {
                if (isTextMode && originalTextContent) {
                    updateTextDisplay();
                }
            });

            // Playback controls
            playBtn.addEventListener('click', () => {
                if (sentences.length === 0) {
                    statusDiv.textContent = 'No text to play on this page.';
                    return;
                }
                isPlaying = true;
                isPaused = false;
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
                audioPlayer.classList.remove('hidden');
                readSentence();
                preloadNextSentences(); // Start pre-fetching
            });

            pauseBtn.addEventListener('click', () => {
                isPlaying = false;
                isPaused = true;
                audioPlayer.pause();
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                statusDiv.textContent = 'Playback paused.';
            });

            stopBtn.addEventListener('click', stopPlayback);

            // Download full document audio handler
            downloadFullBtn.addEventListener('click', async () => {
                if (sentences.length === 0) {
                    statusDiv.textContent = 'No content available to download.';
                    return;
                }
                
                await downloadFullDocumentAudio();
            });

            function stopPlayback() {
                isPlaying = false;
                isPaused = false;
                currentSentenceIndex = 0;
                audioPlayer.pause();
                audioPlayer.src = '';
                clearAudioQueue(); // Clear pre-fetched audio
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                stopBtn.disabled = true;
                removeHighlight(); // Only remove HTML highlight
                updateTimeEstimate(); // Reset time estimate to full document
            }

            // Download full document audio as a single file
            async function downloadFullDocumentAudio() {
                try {
                    // Disable the download button during processing
                    downloadFullBtn.disabled = true;
                    
                    // Show progress bar
                    downloadProgressContainer.classList.remove('hidden');
                    downloadProgressBar.style.width = '0%';
                    downloadProgressText.textContent = '0%';
                    downloadStatusText.textContent = 'Preparing document...';
                    chunkInfo.textContent = '';
                    estimatedTime.textContent = '';
                    
                    const startTime = Date.now();
                    
                    // Get all text content
                    let fullText = '';
                    if (isTextMode) {
                        fullText = originalTextContent || textSentences.join(' ');
                    } else {
                        // For PDF mode, get all sentences from all pages
                        const allSentences = [];
                        ocrResults.forEach((pageData, index) => {
                            if (pageData && pageData.sentences) {
                                allSentences.push(...pageData.sentences);
                            }
                        });
                        fullText = allSentences.join(' ');
                    }
                    
                    if (!fullText.trim()) {
                        throw new Error('No content available to convert to audio');
                    }
                    
                    // Split text into chunks for better progress tracking
                    const chunks = splitTextIntoChunks(fullText, 500); // ~500 words per chunk
                    const audioChunks = [];
                    
                    downloadStatusText.textContent = `Processing ${chunks.length} chunks...`;
                    chunkInfo.textContent = `Document split into ${chunks.length} chunks`;
                    statusDiv.textContent = `Generating full document audio... Processing ${chunks.length} chunks.`;
                    
                    // Process each chunk
                    for (let i = 0; i < chunks.length; i++) {
                        const chunk = chunks[i];
                        
                        // Update progress BEFORE processing (showing current chunk being processed)
                        const progressBefore = Math.round((i / chunks.length) * 100);
                        downloadProgressBar.style.width = `${progressBefore}%`;
                        downloadProgressText.textContent = `${progressBefore}%`;
                        downloadStatusText.textContent = `Processing chunk ${i + 1} of ${chunks.length}...`;
                        chunkInfo.textContent = `Chunk ${i + 1}/${chunks.length} - ${chunk.split(' ').length} words`;
                        statusDiv.textContent = `Processing chunk ${i + 1} of ${chunks.length}...`;
                        
                        // Calculate estimated time remaining
                        if (i > 0) {
                            const elapsed = Date.now() - startTime;
                            const avgTimePerChunk = elapsed / i;
                            const remainingChunks = chunks.length - i;
                            const estimatedRemainingMs = avgTimePerChunk * remainingChunks;
                            const estimatedRemainingMin = Math.ceil(estimatedRemainingMs / 60000);
                            estimatedTime.textContent = `~${estimatedRemainingMin} min remaining`;
                        }
                        
                        // Make API call for this chunk
                        const response = await fetch(FULL_DOC_TTS_API_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 
                                text: chunk,
                                speaker: voiceSelect.value,
                                chunk_index: i,
                                total_chunks: chunks.length
                            }),
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error on chunk ${i + 1}! status: ${response.status}`);
                        }

                        const data = await response.json();
                        
                        if (data.audio) {
                            audioChunks.push(data.audio);
                            
                            // Update progress AFTER successful processing
                            const progressAfter = Math.round(((i + 1) / chunks.length) * 100);
                            downloadProgressBar.style.width = `${progressAfter}%`;
                            downloadProgressText.textContent = `${progressAfter}%`;
                            chunkInfo.textContent = `Completed ${i + 1}/${chunks.length} chunks`;
                        } else {
                            throw new Error(`No audio data received for chunk ${i + 1}.`);
                        }
                    }
                    
                    // Ensure progress shows 100% before combining
                    downloadProgressBar.style.width = '100%';
                    downloadProgressText.textContent = '100%';
                    downloadStatusText.textContent = 'Combining audio chunks...';
                    chunkInfo.textContent = `All ${chunks.length} chunks processed`;
                    estimatedTime.textContent = 'Almost done...';
                    statusDiv.textContent = 'Combining audio chunks...';
                    
                    // Combine all audio chunks
                    const combinedAudioBlob = await combineAudioChunks(audioChunks);
                    
                    // Create download link
                    const url = URL.createObjectURL(combinedAudioBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    
                    // Generate filename based on content type
                    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                    const contentType = isTextMode ? 'text' : 'pdf';
                    a.download = `tts-full-document-${contentType}-${timestamp}.wav`;
                    
                    // Trigger download
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Clean up the URL
                    URL.revokeObjectURL(url);
                    
                    downloadStatusText.textContent = 'Download complete!';
                    chunkInfo.textContent = 'Audio file ready';
                    estimatedTime.textContent = '';
                    statusDiv.textContent = 'Full document audio downloaded successfully!';
                    
                } catch (error) {
                    console.error('Error downloading full document audio:', error);
                    statusDiv.textContent = `Error generating full document audio: ${error.message}`;
                } finally {
                    // Re-enable download button and hide progress bar
                    downloadFullBtn.disabled = false;
                    
                    // Hide progress bar after a delay
                    setTimeout(() => {
                        downloadProgressContainer.classList.add('hidden');
                    }, 2000);
                }
            }

            // Split text into manageable chunks for processing
            function splitTextIntoChunks(text, wordsPerChunk = 500) {
                const words = text.trim().split(/\\s+/);
                const chunks = [];
                
                for (let i = 0; i < words.length; i += wordsPerChunk) {
                    const chunk = words.slice(i, i + wordsPerChunk).join(' ');
                    if (chunk.trim().length > 0) {
                        chunks.push(chunk);
                    }
                }
                
                return chunks.length > 0 ? chunks : [text]; // Return original text if chunking fails
            }

            // Combine multiple base64 audio chunks into a single audio blob
            async function combineAudioChunks(base64AudioChunks) {
                if (base64AudioChunks.length === 1) {
                    // If only one chunk, just convert it to blob
                    return base64ToBlob(base64AudioChunks[0], 'audio/wav');
                }
                
                try {
                    // For multiple chunks, we'll use the Web Audio API to concatenate them
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const audioBuffers = [];
                    
                    // Convert each base64 chunk to audio buffer
                    for (const base64Audio of base64AudioChunks) {
                        const arrayBuffer = base64ToArrayBuffer(base64Audio);
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                        audioBuffers.push(audioBuffer);
                    }
                    
                    // Calculate total length
                    const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
                    const numberOfChannels = audioBuffers[0].numberOfChannels;
                    const sampleRate = audioBuffers[0].sampleRate;
                    
                    // Create a new buffer to hold the combined audio
                    const combinedBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate);
                    
                    // Copy data from each buffer to the combined buffer
                    let offset = 0;
                    for (const buffer of audioBuffers) {
                        for (let channel = 0; channel < numberOfChannels; channel++) {
                            const channelData = buffer.getChannelData(channel);
                            combinedBuffer.getChannelData(channel).set(channelData, offset);
                        }
                        offset += buffer.length;
                    }
                    
                    // Convert the combined buffer back to a WAV blob
                    const wavBlob = audioBufferToWav(combinedBuffer);
                    return wavBlob;
                    
                } catch (error) {
                    console.warn('Failed to combine audio using Web Audio API, concatenating as separate files:', error);
                    // Fallback: just return the first chunk if combination fails
                    return base64ToBlob(base64AudioChunks[0], 'audio/wav');
                }
            }

            // Convert base64 to ArrayBuffer
            function base64ToArrayBuffer(base64) {
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes.buffer;
            }

            // Convert AudioBuffer to WAV Blob
            function audioBufferToWav(buffer) {
                const length = buffer.length;
                const numberOfChannels = buffer.numberOfChannels;
                const sampleRate = buffer.sampleRate;
                const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
                const view = new DataView(arrayBuffer);
                
                // WAV file header
                const writeString = (offset, string) => {
                    for (let i = 0; i < string.length; i++) {
                        view.setUint8(offset + i, string.charCodeAt(i));
                    }
                };
                
                writeString(0, 'RIFF');
                view.setUint32(4, 36 + length * numberOfChannels * 2, true);
                writeString(8, 'WAVE');
                writeString(12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true);
                view.setUint16(22, numberOfChannels, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate * numberOfChannels * 2, true);
                view.setUint16(32, numberOfChannels * 2, true);
                view.setUint16(34, 16, true);
                writeString(36, 'data');
                view.setUint32(40, length * numberOfChannels * 2, true);
                
                // Convert float samples to 16-bit PCM
                let offset = 44;
                for (let i = 0; i < length; i++) {
                    for (let channel = 0; channel < numberOfChannels; channel++) {
                        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                        view.setInt16(offset, sample * 0x7FFF, true);
                        offset += 2;
                    }
                }
                
                return new Blob([arrayBuffer], { type: 'audio/wav' });
            }

            // Playback speed control (WPM)
            wpmInput.addEventListener('input', () => {
                const desiredWPM = parseFloat(wpmInput.value);
                // Ensure WPM is within reasonable bounds
                if (desiredWPM < 50) wpmInput.value = 50;
                if (desiredWPM > 500) wpmInput.value = 500;

                const newPlaybackRate = parseFloat(wpmInput.value) / BASELINE_WPM;
                audioPlayer.playbackRate = newPlaybackRate;
                localStorage.setItem('savedWPM', wpmInput.value); // Save WPM to local storage
                
                // Update time estimate when WPM changes
                updateTimeEstimate();
            });

            audioPlayer.addEventListener('ended', () => {
                if (isPlaying && !isPaused) {
                    currentSentenceIndex++;
                    if (currentSentenceIndex < sentences.length) {
                        readSentence();
                        preloadNextSentences(); // Continue pre-fetching
                    } else {
                        stopPlayback(); // End of text, stop playback
                        const contextInfo = isTextMode ? '' : ` for page ${currentPageNumber}`;
                        statusDiv.textContent = `Playback finished${contextInfo}.`;
                    }
                }
            });

            async function readSentence() {
                if (!isPlaying || isPaused || currentSentenceIndex >= sentences.length) {
                    return;
                }

                removeHighlight(); // Remove previous HTML highlight
                
                let currentSpan;
                if (isTextMode) {
                    if (markdownToggle.checked) {
                        // In markdown mode, highlight the corresponding element(s)
                        if (markdownElementMap[currentSentenceIndex]) {
                            markdownElementMap[currentSentenceIndex].forEach(element => {
                                element.classList.add('highlighted');
                            });
                        }
                    } else {
                        currentSpan = document.getElementById(`text-sentence-${currentSentenceIndex}`);
                    }
                } else {
                    currentSpan = document.getElementById(`sentence-${currentSentenceIndex}`);
                }
                
                if (currentSpan) {
                    currentSpan.classList.add('highlighted');
                }

                const sentence = sentences[currentSentenceIndex];
                
                // Update time estimate for remaining content
                updateTimeEstimate();
                
                if (isTextMode) {
                    statusDiv.textContent = `Playing sentence ${currentSentenceIndex + 1}/${sentences.length}.`;
                } else {
                    statusDiv.textContent = `Playing sentence ${currentSentenceIndex + 1}/${sentences.length} on page ${currentPageNumber}.`;
                }

                // Try to use cached audio first
                let audioUrl = null;
                
                if (isTextMode) {
                    audioUrl = textAudioCache[currentSentenceIndex];
                } else if (ocrResults[currentPageNumber - 1] && ocrResults[currentPageNumber - 1].audioCache[currentSentenceIndex]) {
                    audioUrl = ocrResults[currentPageNumber - 1].audioCache[currentSentenceIndex];
                }

                if (audioUrl) {
                    audioPlayer.src = audioUrl;
                    audioPlayer.playbackRate = parseFloat(wpmInput.value) / BASELINE_WPM; // Apply speed
                    audioPlayer.play();
                } else if (audioQueue.length > 0 && audioQueue[0].index === currentSentenceIndex) {
                    const queuedAudio = audioQueue.shift();
                    audioPlayer.src = queuedAudio.url;
                    audioPlayer.playbackRate = parseFloat(wpmInput.value) / BASELINE_WPM; // Apply speed
                    audioPlayer.play();
                    // Store in appropriate cache after playing from pre-fetch queue
                    if (isTextMode) {
                        textAudioCache[currentSentenceIndex] = queuedAudio.url;
                    } else {
                        if (!ocrResults[currentPageNumber - 1]) ocrResults[currentPageNumber - 1] = { pageNum: currentPageNumber, sentences: [], audioCache: [] };
                        ocrResults[currentPageNumber - 1].audioCache[currentSentenceIndex] = queuedAudio.url;
                    }
                } else {
                    // If not cached or out of sync, fetch directly
                    const contextInfo = isTextMode ? '' : ` on page ${currentPageNumber}`;
                    statusDiv.textContent = `Requesting audio for sentence ${currentSentenceIndex + 1}/${sentences.length}${contextInfo}...`;
                    try {
                        audioUrl = await fetchAudioFromBackend(sentence, currentSentenceIndex, isTextMode ? 0 : currentPageNumber);
                        audioPlayer.src = audioUrl;
                        audioPlayer.playbackRate = parseFloat(wpmInput.value) / BASELINE_WPM; // Apply speed
                        audioPlayer.play();
                    } catch (error) {
                        statusDiv.textContent = `Error generating audio for sentence ${currentSentenceIndex + 1}: ${error.message}`;
                        console.error(`Error generating audio for sentence ${currentSentenceIndex + 1}:`, error);
                        // Attempt to proceed to the next sentence even if current one fails
                        currentSentenceIndex++;
                        if (currentSentenceIndex < sentences.length) {
                            readSentence();
                        } else {
                            stopPlayback();
                            const contextInfo = isTextMode ? '' : ` for page ${currentPageNumber}`;
                            statusDiv.textContent = `Playback finished${contextInfo} with errors.`;
                        }
                    }
                }
            }

            async function fetchAudioFromBackend(text, sentenceIdx, pageNum) {
                // Check cache first
                if (isTextMode) {
                    if (textAudioCache[sentenceIdx]) {
                        return textAudioCache[sentenceIdx];
                    }
                } else if (ocrResults[pageNum - 1] && ocrResults[pageNum - 1].audioCache[sentenceIdx]) {
                    return ocrResults[pageNum - 1].audioCache[sentenceIdx];
                }

                const response = await fetch(TTS_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        text: text,
                        speaker: voiceSelect.value
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.audio) {
                    const audioBlob = base64ToBlob(data.audio, `audio/${data.format}`);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    // Store in appropriate cache
                    if (isTextMode) {
                        textAudioCache[sentenceIdx] = audioUrl;
                    } else {
                        if (!ocrResults[pageNum - 1]) ocrResults[pageNum - 1] = { pageNum: pageNum, sentences: [], audioCache: [] };
                        ocrResults[pageNum - 1].audioCache[sentenceIdx] = audioUrl;
                    }
                    return audioUrl;
                } else {
                    throw new Error("No audio data received from backend.");
                }
            }

            async function preloadNextSentences() {
                if (isFetchingAudio) return; // Don't start another fetch if one is in progress

                isFetchingAudio = true;
                for (let i = 1; i <= PREFETCH_COUNT; i++) {
                    const nextIndex = currentSentenceIndex + i;
                    // Check if sentence exists and if audio is not already cached or in queue
                    let isAlreadyCached = false;
                    if (isTextMode) {
                        isAlreadyCached = textAudioCache[nextIndex];
                    } else {
                        isAlreadyCached = ocrResults[currentPageNumber - 1] && ocrResults[currentPageNumber - 1].audioCache[nextIndex];
                    }
                    
                    if (nextIndex < sentences.length && 
                        !isAlreadyCached &&
                        !audioQueue.some(item => item.index === nextIndex)) {
                        
                        const sentenceToFetch = sentences[nextIndex];
                        try {
                            // Update status only if we are actively pre-fetching and not playing
                            if (!isPlaying || audioPlayer.paused) {
                                const contextInfo = isTextMode ? '' : ` on page ${currentPageNumber}`;
                                statusDiv.textContent = `Pre-fetching audio for sentence ${nextIndex + 1}/${sentences.length}${contextInfo}...`;
                            }
                            const audioUrl = await fetchAudioFromBackend(sentenceToFetch, nextIndex, isTextMode ? 0 : currentPageNumber);
                            audioQueue.push({ index: nextIndex, url: audioUrl });
                            audioQueue.sort((a, b) => a.index - b.index); // Keep queue sorted
                        } catch (error) {
                            console.error(`Error pre-fetching audio for sentence ${nextIndex + 1}:`, error);
                            // Continue to try and pre-fetch other sentences even if one fails
                        }
                    }
                }
                isFetchingAudio = false;
                // Restore appropriate status message
                if (isTextMode) {
                    statusDiv.textContent = `Text ready. Found ${sentences.length} sentences.`;
                } else if (pdfDocument && ocrResults.length < pdfDocument.numPages) {
                    statusDiv.textContent = `Background OCR: Processing page ${ocrResults.length + 1}/${pdfDocument.numPages}...`;
                } else if (pdfDocument) {
                    statusDiv.textContent = `Page ${currentPageNumber} OCR complete. Extracted ${sentences.length} sentences.`;
                }
            }

            function removeHighlight() {
                // Remove standard highlighted elements
                const highlighted = document.querySelectorAll('.highlighted');
                highlighted.forEach(element => {
                    element.classList.remove('highlighted');
                });
                
                // Remove markdown container background highlight (legacy)
                if (markdownRenderedContainer) {
                    markdownRenderedContainer.style.backgroundColor = '';
                }
            }

            function base64ToBlob(base64, mimeType) {
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                return new Blob([byteArray], { type: mimeType });
            }

            function clearAudioQueue() {
                audioQueue.forEach(item => URL.revokeObjectURL(item.url));
                audioQueue = [];
            }

            // New function to clear all audio caches for a given page or all pages
            function clearPageAudioCache(pageNum = null) {
                if (pageNum === null) {
                    // Clear all pages' audio caches
                    ocrResults.forEach(pageData => {
                        if (pageData && pageData.audioCache) {
                            pageData.audioCache.forEach(url => URL.revokeObjectURL(url));
                            pageData.audioCache = [];
                        }
                    });
                } else if (ocrResults[pageNum - 1] && ocrResults[pageNum - 1].audioCache) {
                    // Clear specific page's audio cache
                    ocrResults[pageNum - 1].audioCache.forEach(url => URL.revokeObjectURL(url));
                    ocrResults[pageNum - 1].audioCache = [];
                }
            }

            // Navigation button handlers
            prevPageBtn.addEventListener('click', () => {
                if (!isTextMode && currentPageNumber > 1) {
                    clearPageAudioCache(currentPageNumber); // Clear cache for current page when navigating away
                    renderPage(currentPageNumber - 1);
                }
            });

            nextPageBtn.addEventListener('click', () => {
                if (!isTextMode && pdfDocument && currentPageNumber < pdfDocument.numPages) {
                    clearPageAudioCache(currentPageNumber); // Clear cache for current page when navigating away
                    renderPage(currentPageNumber + 1);
                }
            });

            function updateNavigationButtons() {
                if (isTextMode) {
                    prevPageBtn.disabled = true;
                    nextPageBtn.disabled = true;
                } else {
                    prevPageBtn.disabled = (currentPageNumber <= 1);
                    nextPageBtn.disabled = (!pdfDocument || currentPageNumber >= pdfDocument.numPages);
                }
            }

            // Click-to-play and hover highlight for sentences
            document.addEventListener('click', (event) => {
                const target = event.target;
                let sentenceIndex = -1;
                
                // Handle plain text spans
                if (target.tagName === 'SPAN') {
                    if (target.id.startsWith('sentence-')) {
                        sentenceIndex = parseInt(target.id.replace('sentence-', ''));
                    } else if (target.id.startsWith('text-sentence-')) {
                        sentenceIndex = parseInt(target.id.replace('text-sentence-', ''));
                    }
                    
                    if (!isNaN(sentenceIndex) && sentenceIndex < sentences.length) {
                        playFromSentence(sentenceIndex);
                    }
                }
                
                // Handle markdown elements - check if clicked element or its parent has clickable-element class
                let clickableElement = target.closest('.clickable-element');
                if (clickableElement && clickableElement.dataset.sentenceIndices) {
                    try {
                        const indices = JSON.parse(clickableElement.dataset.sentenceIndices);
                        if (indices.length > 0) {
                            playFromSentence(indices[0]);
                        }
                    } catch (e) {
                        console.error('Error parsing sentence indices:', e);
                    }
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (event) => {
                if (event.code === 'Space') {
                    event.preventDefault(); // Prevent default spacebar action (scrolling)
                    if (isPlaying) {
                        pauseBtn.click();
                    } else if (sentences.length > 0) {
                        playBtn.click();
                    }
                }
            });

            // Initial setup
            initializeTesseract();

            // Load saved settings from localStorage
            loadSavedSettings();

            updateNavigationButtons(); // Set initial state of nav buttons
            downloadFullBtn.disabled = true; // Initially disable download button
        </script>
    </body>
    </html>
"""

@app.route('/tts', methods=['POST'])
def text_to_speech():
    if tts is None:
        return jsonify({"error": "TTS model not loaded."}), 500

    data = request.json
    text = data.get('text')
    speaker = data.get('speaker', 'p225')  # Default to a male speaker

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        wav_file = io.BytesIO()
        
        # Use speaker if available and model supports it
        if hasattr(tts, 'speakers') and tts.speakers and speaker in tts.speakers:
            tts.tts_to_file(text=text, speaker=speaker, file_path=wav_file)
        else:
            # Use default speaker
            tts.tts_to_file(text=text, file_path=wav_file)
            
        wav_file.seek(0) # Rewind to the beginning of the BytesIO object

        # Base64 encode the audio data
        audio_base64 = base64.b64encode(wav_file.read()).decode('utf-8')

        return jsonify({"audio": audio_base64, "format": "wav"})
    except Exception as e:
        print(f"Error during TTS generation: {e}")
        return jsonify({"error": str(e)}), 500

# New route to get available speakers
@app.route('/speakers', methods=['GET'])
def get_speakers():
    if tts is None:
        return jsonify({"error": "TTS model not loaded."}), 500
    
    if hasattr(tts, 'speakers') and tts.speakers:
        return jsonify({"speakers": tts.speakers})
    else:
        return jsonify({"speakers": []})

# New route to generate full document audio with chunked processing
@app.route('/full-document-tts', methods=['POST'])
def full_document_tts():
    if tts is None:
        return jsonify({"error": "TTS model not loaded."}), 500

    data = request.json
    text = data.get('text')
    speaker = data.get('speaker', 'p225')
    chunk_index = data.get('chunk_index', None)
    total_chunks = data.get('total_chunks', None)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Create a temporary file for the audio chunk
        import tempfile
        import os
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.close()
        
        # Generate TTS for the text chunk
        if hasattr(tts, 'speakers') and tts.speakers and speaker in tts.speakers:
            tts.tts_to_file(text=text, speaker=speaker, file_path=temp_file.name)
        else:
            tts.tts_to_file(text=text, file_path=temp_file.name)
        
        # Read the file and encode it
        with open(temp_file.name, 'rb') as f:
            audio_data = f.read()
        
        # Clean up the temporary file
        os.unlink(temp_file.name)
        
        # Base64 encode the audio data
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')

        response_data = {
            "audio": audio_base64, 
            "format": "wav"
        }
        
        # Include progress information if this is part of chunked processing
        if chunk_index is not None and total_chunks is not None:
            response_data["chunk_index"] = chunk_index
            response_data["total_chunks"] = total_chunks
            response_data["progress"] = round((chunk_index + 1) / total_chunks * 100, 1)

        return jsonify(response_data)
    except Exception as e:
        print(f"Error during TTS generation for chunk {chunk_index}: {e}")
        return jsonify({"error": str(e)}), 500

# route the frontend to the welcome page
@app.route('/')
def index():
    status = "TTS Model Loaded" if tts is not None else "TTS Model Failed to Load"
    return render_template_string(HTML_TEMPLATE, 
                                status=status, 
                                device=device, 
                                model_name=model_name,
                                port=port)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=port, debug=True)
