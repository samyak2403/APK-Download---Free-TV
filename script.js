// Configuration - Replace these with your GitHub repository details
const GITHUB_USERNAME = 'samyak2403'; // Replace with your GitHub username
const GITHUB_REPO = 'Download---Free-TV';   // Replace with your repository name
const APK_FILENAME_PATTERN = '.apk';     // Pattern to match APK files

// Global variables
let downloadUrl = '';
let latestRelease = null;

// Format bytes to readable size
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Fetch latest release from GitHub
async function fetchLatestRelease() {
    try {
        const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/releases/latest`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch release information');
        }
        
        const release = await response.json();
        latestRelease = release;
        
        // Find APK file in assets
        const apkAsset = release.assets.find(asset => 
            asset.name.toLowerCase().includes(APK_FILENAME_PATTERN)
        );
        
        if (!apkAsset) {
            throw new Error('No APK file found in the latest release');
        }
        
        // Update UI with release information
        document.getElementById('version').textContent = release.tag_name;
        document.getElementById('fileSize').textContent = formatBytes(apkAsset.size);
        
        // Update release notes
        const releaseNotesElement = document.getElementById('releaseNotes');
        if (release.body) {
            // Convert markdown-style lists to HTML
            const formattedNotes = release.body
                .split('\n')
                .map(line => {
                    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                        return `<li>${line.trim().substring(2)}</li>`;
                    }
                    return line;
                })
                .join('\n');
            
            if (formattedNotes.includes('<li>')) {
                releaseNotesElement.innerHTML = `<ul>${formattedNotes}</ul>`;
            } else {
                releaseNotesElement.innerHTML = formattedNotes.replace(/\n/g, '<br>');
            }
        } else {
            releaseNotesElement.textContent = 'No release notes available.';
        }
        
        // Store download URL
        downloadUrl = apkAsset.browser_download_url;
        
        // Enable download button
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error('Error fetching release:', error);
        document.getElementById('version').textContent = 'N/A';
        document.getElementById('fileSize').textContent = 'N/A';
        document.getElementById('releaseNotes').innerHTML = 
            '<p style="color: #e74c3c;">Unable to load release information. Please check your GitHub repository configuration or try again later.</p>';
    }
}


// Handle download button click
function handleDownload() {
    const downloadBtn = document.getElementById('downloadBtn');
    const progressContainer = document.getElementById('downloadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = progressContainer.querySelector('.progress-text');
    
    if (!downloadUrl || downloadUrl === '#') {
        alert('Please configure your GitHub repository details in script.js');
        return;
    }
    
    // Show progress
    progressContainer.style.display = 'block';
    downloadBtn.disabled = true;
    
    // Simulate progress animation
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            progressText.textContent = 'Download starting...';
        } else {
            progressText.textContent = 'Preparing download... ' + progress + '%';
        }
    }, 100);
    
    // Start download
    setTimeout(() => {
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = latestRelease?.assets?.find(a => a.name.includes('.apk'))?.name || 'app-release.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset UI after download starts
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
            downloadBtn.disabled = false;
            progressText.textContent = 'Preparing download...';
        }, 2000);
    }, 2000);
}

// Add smooth scroll reveal for elements
function addScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.release-notes, .instructions').forEach(el => {
        observer.observe(el);
    });
}

// Add ripple effect to button
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add CSS for ripple effect dynamically
function addRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Disable button initially
    document.getElementById('downloadBtn').disabled = true;
    
    // Add ripple styles
    addRippleStyles();
    
    // Fetch latest release
    fetchLatestRelease();
    
    // Add event listener to download button
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', handleDownload);
    downloadBtn.addEventListener('click', createRipple);
    
    // Add scroll reveal
    addScrollReveal();
    
    // Add hover sound effect (optional, silent by default)
    downloadBtn.addEventListener('mouseenter', () => {
        downloadBtn.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});


