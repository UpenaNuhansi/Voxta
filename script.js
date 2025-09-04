        const playButton = document.getElementById('playButton')
        const buttonText = document.getElementById('buttonText')
        const playIcon = document.getElementById('playIcon')
        const loadingIndicator = document.getElementById('loadingIndicator')
        const audioContainer = document.getElementById('audioContainer')
        const errorMessage = document.getElementById('errorMessage')
        const fileInput = document.getElementById('fileInput')
        const fileStatus = document.getElementById('fileStatus')

        // Desktop nav links and pop-ups
        const aboutLink = document.getElementById('aboutLink')
        const contactLink = document.getElementById('contactLink')
        const aboutPopup = document.getElementById('aboutPopup')
        const contactPopup = document.getElementById('contactPopup')

        // Mobile menu elements
        const hamburgerBtn = document.getElementById('hamburgerBtn')
        const closeMenuBtn = document.getElementById('closeMenuBtn')
        const mobileMenu = document.getElementById('mobileMenu')
        const mobileAboutLink = document.getElementById('mobileAboutLink')
        const mobileContactLink = document.getElementById('mobileContactLink')

        let documentText = `Welcome to Voxta. Please upload a document to begin.`

        if (window.pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js'
        }

        let hideTimeout;

        // Function to show a pop-up
        function showPopup(element) {
            clearTimeout(hideTimeout);
            element.classList.remove('hidden', 'scale-95', 'opacity-0');
            element.classList.add('scale-100', 'opacity-100');
        }

        // Function to hide a pop-up with a delay
        function startHidePopup(element) {
            hideTimeout = setTimeout(() => {
                element.classList.remove('scale-100', 'opacity-100');
                element.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    element.classList.add('hidden');
                }, 300); // Wait for the transition to finish
            }, 100); // 100ms delay before starting the hide transition
        }

        // --- Desktop Pop-up Logic ---
        if (aboutLink && aboutPopup) {
            aboutLink.addEventListener('mouseover', () => showPopup(aboutPopup));
            aboutLink.addEventListener('mouseleave', () => startHidePopup(aboutPopup));
            aboutPopup.addEventListener('mouseover', () => clearTimeout(hideTimeout));
            aboutPopup.addEventListener('mouseleave', () => startHidePopup(aboutPopup));
        }

        if (contactLink && contactPopup) {
            contactLink.addEventListener('mouseover', () => showPopup(contactPopup));
            contactLink.addEventListener('mouseleave', () => startHidePopup(contactPopup));
            contactPopup.addEventListener('mouseover', () => clearTimeout(hideTimeout));
            contactPopup.addEventListener('mouseleave', () => startHidePopup(contactPopup));
        }

        // --- Mobile Menu Logic ---
        hamburgerBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('-translate-x-full');
            mobileMenu.classList.add('translate-x-0');
        });

        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('-translate-x-full');
        });

        // Add click events for mobile menu links to show pop-ups
        if (mobileAboutLink && aboutPopup) {
            mobileAboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPopup(aboutPopup);
                mobileMenu.classList.remove('translate-x-0');
                mobileMenu.classList.add('-translate-x-full');
            });
        }
        if (mobileContactLink && contactPopup) {
            mobileContactLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPopup(contactPopup);
                mobileMenu.classList.remove('translate-x-0');
                mobileMenu.classList.add('-translate-x-full');
            });
        }
        // --- End Mobile Menu Logic ---

        fileInput.addEventListener('change', handleFileUpload)

        async function handleFileUpload(event) {
            const file = event.target.files[0]
            if (!file) return
            fileStatus.textContent = `Processing "${file.name}"...`
            errorMessage.textContent = ''
            audioContainer.innerHTML = ''
            playButton.disabled = false;
            try {
                if (file.type === 'application/pdf') {
                    documentText = await readPdfFile(file)
                } else if (file.type === 'text/plain') {
                    documentText = await readTxtFile(file)
                } else {
                    throw new Error('Unsupported file type. Please upload a .txt or .pdf file.')
                }
                fileStatus.textContent = `Ready: "${file.name}".`
            } catch (error) {
                errorMessage.textContent = `Error reading file: ${error.message}`
                fileStatus.textContent = 'File processing failed.'
                console.error(error)
                playButton.disabled = true;
            }
        }
        function readTxtFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = e => resolve(e.target.result)
                reader.onerror = () => reject(new Error('Failed to read the text file.'))
                reader.readAsText(file)
            })
        }
        async function readPdfFile(file) {
            const reader = new FileReader()
            return new Promise((resolve, reject) => {
                reader.onload = async e => {
                    const data = new Uint8Array(e.target.result)
                    try {
                        const pdf = await pdfjsLib.getDocument({ data }).promise
                        let fullText = ''
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i)
                            const textContent = await page.getTextContent()
                            fullText += textContent.items.map(item => item.str).join(' ') + '\n'
                        }
                        resolve(fullText)
                    } catch (err) {
                        reject(new Error('Failed to parse the PDF file.'))
                    }
                }
                reader.onerror = () => reject(new Error('Failed to read the PDF file.'))
                reader.readAsArrayBuffer(file)
            })
        }
        function base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i)
            return bytes.buffer
        }
        function pcmToWav(pcmData, sampleRate) {
            const numChannels = 1
            const bitsPerSample = 16
            const byteRate = sampleRate * numChannels * bitsPerSample / 8
            const blockAlign = numChannels * bitsPerSample / 8
            const dataSize = pcmData.length * 2
            const buffer = new ArrayBuffer(44 + dataSize)
            const view = new DataView(buffer)
            writeString(view, 0, 'RIFF')
            view.setUint32(4, 36 + dataSize, true)
            writeString(view, 8, 'WAVE')
            writeString(view, 12, 'fmt ')
            view.setUint32(16, 16, true)
            view.setUint16(20, 1, true)
            view.setUint16(22, numChannels, true)
            view.setUint32(24, sampleRate, true)
            view.setUint32(28, byteRate, true)
            view.setUint16(32, blockAlign, true)
            view.setUint16(34, bitsPerSample, true)
            writeString(view, 36, 'data')
            view.setUint32(40, dataSize, true)
            const pcm16 = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.length)
            for (let i = 0; i < pcm16.length; i++) {
                view.setInt16(44 + i * 2, pcm16[i], true)
            }
            return new Blob([view], { type: 'audio/wav' })
        }
        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i))
        }
        const apiUrl = 'http://localhost:3000/api/generate-audio'
        playButton.addEventListener('click', async () => {
            playButton.disabled = true
            loadingIndicator.classList.remove('hidden')
            audioContainer.innerHTML = ''
            errorMessage.textContent = ''

            const payload = {
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: `Read the following text clearly and at a moderate pace: ${documentText}` }] }],
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                }
            }
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || `HTTP ${response.status}`)
                }
                const result = await response.json()
                const part = result?.candidates?.[0]?.content?.parts?.[0]
                const audioData = part?.inlineData?.data
                const mimeType = part?.inlineData?.mimeType
                if (audioData && mimeType && mimeType.startsWith('audio/')) {
                    document.body.classList.add('bg-alt')
                    const sampleRateMatch = mimeType.match(/rate=(\d+)/)
                    const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000
                    const pcmDataBuffer = base64ToArrayBuffer(audioData)
                    const pcm16 = new Int16Array(pcmDataBuffer)
                    const wavBlob = pcmToWav(pcm16, sampleRate)
                    const audioUrl = URL.createObjectURL(wavBlob)

                   
            // Call the new function to create the styled audio player
            createAudioPlayer(audioUrl, wavBlob);

        } else {
            throw new Error('Invalid audio data received from API.')
        }

    } catch (err) {
        console.error('Error generating audio:', err)
        errorMessage.textContent = `Failed to generate audio. ${err.message}`

    } finally {
        loadingIndicator.classList.add('hidden')
        playButton.disabled = false
    }
})

// New function to create the styled audio player
function createAudioPlayer(audioUrl, wavBlob) {
    // Clear any previous players
    audioContainer.innerHTML = '';

    // Create the audio element
    const audio = new Audio(audioUrl);
    audio.autoplay = true;

    // Create a container for the main player controls (play/pause, time, progress)
    const mainPlayerWrapper = document.createElement('div');
    mainPlayerWrapper.className = 'w-full flex items-center bg-gray-800/80 backdrop-blur-md rounded-full p-2 space-x-2 shadow-lg';

    // Create a container for the bottom buttons (speed, download)
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'w-full flex items-center justify-between mt-4';

    // Create custom play/pause button
    const playPauseButton = document.createElement('button');
    playPauseButton.id = 'customPlayPauseBtn';
    playPauseButton.className = 'flex-shrink-0 p-2 rounded-full text-white hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center';
    playPauseButton.innerHTML = `
        <svg id="customPlayIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <svg id="customPauseIcon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    `;

    // Create a time display element
    const timeDisplay = document.createElement('span');
    timeDisplay.className = 'text-gray-300 font-medium text-xs flex-shrink-0 w-20 text-center';
    timeDisplay.textContent = '0:00 / 0:00';

    // Create a progress bar
    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.value = '0';
    progressBar.className = 'flex-grow h-1 rounded-lg bg-gray-600 appearance-none cursor-pointer custom-range-thumb';
    progressBar.min = "0";
    progressBar.max = "100";

    // Add playback speed button
    const speedButton = document.createElement('button');
    speedButton.id = 'speedButton';
    speedButton.className = 'flex-shrink-0 px-3 py-1 text-xs md:text-sm font-semibold rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200';
    speedButton.textContent = '1x';
    
    // Add download button
    const downloadButton = document.createElement('a');
    downloadButton.id = 'downloadButton';
    downloadButton.className = 'flex-shrink-0 px-3 py-1 text-xs md:text-sm font-semibold rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200 flex items-center';
    downloadButton.href = audioUrl;
    downloadButton.download = 'voxta_audio.wav';
    downloadButton.innerHTML = `
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        Download
    `;

    // Append elements to their respective containers
    mainPlayerWrapper.appendChild(playPauseButton);
    mainPlayerWrapper.appendChild(timeDisplay);
    mainPlayerWrapper.appendChild(progressBar);
    
    buttonWrapper.appendChild(speedButton);
    buttonWrapper.appendChild(downloadButton);

    // Append the two containers to the main audioContainer
    audioContainer.appendChild(mainPlayerWrapper);
    audioContainer.appendChild(buttonWrapper);

    // Add the audio element to the DOM (it can be hidden)
    document.body.appendChild(audio);

    // --- Event Listeners for Custom Controls ---
    let playbackSpeeds = [1.0, 1.5, 2.0];
    let currentSpeedIndex = 0;
    
    speedButton.addEventListener('click', () => {
        currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
        audio.playbackRate = playbackSpeeds[currentSpeedIndex];
        speedButton.textContent = `${playbackSpeeds[currentSpeedIndex]}x`;
    });

    playPauseButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });
    
    audio.onplaying = () => {
        document.getElementById('customPlayIcon').classList.add('hidden');
        document.getElementById('customPauseIcon').classList.remove('hidden');
        // Update main button text/icon when custom player starts playing
        buttonText.textContent = 'Playing...';
        playIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    };

    audio.onpause = () => {
        document.getElementById('customPlayIcon').classList.remove('hidden');
        document.getElementById('customPauseIcon').classList.add('hidden');
        // Update main button text/icon when custom player pauses
        buttonText.textContent = 'Paused'; // or 'Play Again' depending on desired behavior
        playIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    };

    audio.onended = () => {
        // Reset button and icon when audio ends
        document.getElementById('customPlayIcon').classList.remove('hidden');
        document.getElementById('customPauseIcon').classList.add('hidden');
        
        buttonText.textContent = 'Play Again';
        document.body.classList.remove('bg-alt');
        playIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
        progressBar.value = 0; // Reset progress bar
        timeDisplay.textContent = '0:00 / 0:00'; // Reset time display
    };
    
    audio.ontimeupdate = () => {
        const currentTime = formatTime(audio.currentTime);
        const duration = formatTime(audio.duration);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
        // Ensure duration is not NaN before calculating progress
        if (!isNaN(audio.duration) && audio.duration > 0) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
        }
    };

    // Listen for when audio metadata is loaded to set max duration and initial time
    audio.onloadedmetadata = () => {
        progressBar.max = 100; // Max value for the range input
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
    };

    progressBar.addEventListener('input', () => {
        const seekTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    });
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00'; // Handle invalid time
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}