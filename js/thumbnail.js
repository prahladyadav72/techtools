

        
        // Thumbnail quality configurations
        const thumbnailQualities = [
            {
                name: 'Maximum Resolution',
                url: 'maxresdefault.jpg',
                resolution: '1920x1080',
                badge: 'HD',
                badgeClass: 'hd'
            },
            {
                name: 'Standard Definition',
                url: 'sddefault.jpg',
                resolution: '640x480',
                badge: 'SD',
                badgeClass: 'sd'
            },
            {
                name: 'High Quality',
                url: 'hqdefault.jpg',
                resolution: '480x360',
                badge: 'HQ',
                badgeClass: ''
            },
            {
                name: 'Medium Quality',
                url: 'mqdefault.jpg',
                resolution: '320x180',
                badge: 'MQ',
                badgeClass: ''
            },
            {
                name: 'Default Quality',
                url: 'default.jpg',
                resolution: '120x90',
                badge: 'Default',
                badgeClass: ''
            }
        ];

        function getVideoId(url) {
            // Handle different YouTube URL formats
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^#&?\/]{11})/,
                /^([^#&?\/]{11})$/
            ];

            for (let pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
        }

        function getThumbnails() {
            const urlInput = document.getElementById('videoUrl');
            const url = urlInput.value.trim();
            
            if (!url) {
                showError('Please enter a YouTube video URL');
                return;
            }

            const videoId = getVideoId(url);
            if (!videoId) {
                showError('Invalid YouTube URL. Please enter a valid video link (youtube.com/watch?v=... or youtu.be/...)');
                return;
            }

            // Hide error and show results
            document.getElementById('errorMessage').classList.remove('active');
            displayThumbnails(videoId);
        }

        function displayThumbnails(videoId) {
            const results = document.getElementById('results');
            const thumbnailsGrid = document.getElementById('thumbnailsGrid');
            const videoIdDisplay = document.getElementById('videoIdDisplay');
            const videoLinkDisplay = document.getElementById('videoLinkDisplay');

            // Display video info
            videoIdDisplay.innerHTML = `<strong>Video ID:</strong> ${videoId}`;
            videoLinkDisplay.innerHTML = `<strong>Video URL:</strong> <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="color: #667eea;">https://www.youtube.com/watch?v=${videoId}</a>`;

            // Clear previous thumbnails
            thumbnailsGrid.innerHTML = '';

            // Generate thumbnail cards
            thumbnailQualities.forEach(quality => {
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${quality.url}`;
                
                const card = document.createElement('div');
                card.className = 'thumbnail-card';
                card.innerHTML = `
                    <h4>${quality.name} <span class="quality-badge ${quality.badgeClass}">${quality.badge}</span></h4>
                    <p class="resolution">${quality.resolution}</p>
                    <img 
                        src="${thumbnailUrl}" 
                        alt="${quality.name} thumbnail" 
                        class="thumbnail-preview"
                        onerror="this.classList.add('error'); this.nextElementSibling.style.display='block';"
                    >
                    <p style="display:none; color: #999; font-size: 0.85rem; margin-bottom: 1rem;">Thumbnail not available in this quality</p>
                    <button class="btn btn-download" onclick="downloadThumbnail('${thumbnailUrl}', '${videoId}_${quality.url}')">
                        ⬇️ Download ${quality.badge}
                    </button>
                `;
                thumbnailsGrid.appendChild(card);
            });

            results.classList.add('active');
        }

       function downloadThumbnail(url, filename) {
    const btn = event.target;
    const originalText = btn.textContent;

    btn.textContent = '⏳ Downloading...';
    btn.disabled = true;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch image');
            return response.blob();
        })
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);

            btn.textContent = '✓ Downloaded';
            btn.style.background = '#28a745';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 1500);
        })
        .catch(() => {
            btn.textContent = '❌ Failed';
            btn.disabled = false;
        });
}

        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.classList.add('active');
            document.getElementById('results').classList.remove('active');
            
            setTimeout(() => {
                errorDiv.classList.remove('active');
            }, 5000);
        }

        // Allow Enter key to trigger thumbnail extraction
        document.getElementById('videoUrl').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getThumbnails();
            }
        });
  