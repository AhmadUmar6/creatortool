// Creator Finder Algorithm - Optimized for efficiency
class CreatorFinder {
    constructor() {
        // Hardcoded API Keys
        this.apiKeys = [
            'AIzaSyDTsHxY3en1zfYiQ3NYYhGAxcdtCYhUpto',
            'AIzaSyC5EP-cgMP02pPApxKqpgnO6A_da4o-fG4',
            'AIzaSyB1QbiSEFIAq530X1Ci7X1BZnNLvb4S0dQ',
            'AIzaSyBJY9FTjSmxmxWou3zwsC6xO7Tm8u7N-_k',
            'AIzaSyA_B5ZOSYL94tnp_GBr6zbyLgyW84kvZLA',
            'AIzaSyDxpw4YBEfvQwJ_ypAt0mFCnm_BU-54tKs',
            'AIzaSyBIYY0iWM_WaIJsGrvYsa1GDBwCVawi6f8',
            'AIzaSyAgthrT-72aXXx9pjaqNcbBPEl2C5owXtQ',
            'AIzaSyCWFArKITf6hawq4UMeHUq52kpAMf3y5ks',
            'AIzaSyAcLqVYCgFcKbj7V8pNP4tqgsVk9J9vIMU',
            'AIzaSyDUHugTmMB5uN3eMsV-qZgdgx5TbGudFIo',
            'AIzaSyD4Dg_aBNoF-Cvr015y6kZ2tR1v2nuFuGc',
            'AIzaSyBptxhOm2j8OVREm5XukP3qZr3iUu1tim0',
            'AIzaSyAYXVV320L-21IZ6BKUt4l1wxpBRJns85s',
            'AIzaSyBQiO5EcypoQoLmQHJgmnGEgOAz8vi_KiQ',
            'AIzaSyDcckgur6N0wyB3Oo1XXUHbJNifpCt-xQU',
            'AIzaSyDHWKv4mkgt7ciDIlhm-6ewtxhPsUu1Knk',
            'AIzaSyB3aoF8NG_uGylNMd1rLgOCathntFI9B0o',
            'AIzaSyBlEZDP644tOQ8BF7sQgYCYkpXWg4sPUBo',
            'AIzaSyA12s4sWQ8ClOi2nzJClH5t6UvzMEvHo84',
            'AIzaSyCkx5sIbnHqCEp4JxnkqcYGgn1pMIJivNk',
            'AIzaSyAJGVVEVL6D3XeH-BdqYbnro_3vXOVt4rk',
            'AIzaSyCCwWGxj7kzSE5yV5QzRbYWTKVLzTD8Wm0',
            'AIzaSyCZe4FdgYYGMOdNsXwr86MdgmZCy-n1T4I',
            'AIzaSyAov4vg5G2z9VixaLfPTCycTar8-z6S5vM',
            'AIzaSyCWEP-hds047eC170NjiRGfPpE9xuFi0K8',
            'AIzaSyBlRhR8-dhIhI1wu_XDLf9Z-rDHx9erJ8s',
            'AIzaSyA4Ix79EAsANrhIlnGGMDK4XPck_tgfkUI',
            'AIzaSyCMAEf2R3gma3adN4E6qFLWyDZVXH3HQBY'
        ];
        this.currentKeyIndex = 0;
        this.quotaUsed = 0;
        this.results = [];
        this.spamKeywords = ['no copyright', 'full highlights', 'copyright free', 'highlights hd', 'free use'];
    }

    log(msg) {
        const container = document.getElementById('logContainer');
        container.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
        container.scrollTop = container.scrollHeight;
    }

    updateProgress(text, percent) {
        document.getElementById('progressText').textContent = text;
        document.getElementById('progressBar').style.width = percent + '%';
    }

    updateQuota(cost) {
        this.quotaUsed += cost;
        document.getElementById('quotaUsed').textContent = this.quotaUsed;
    }

    async apiCall(endpoint, params) {
        const key = this.apiKeys[this.currentKeyIndex];
        const url = `https://www.googleapis.com/youtube/v3/${endpoint}?key=${key}&${new URLSearchParams(params)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 403) {
                    this.switchApiKey();
                    return this.apiCall(endpoint, params);
                }
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            this.log(`API_ERROR: ${error.message}`);
            throw error;
        }
    }

    switchApiKey() {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        document.getElementById('currentApi').textContent = this.currentKeyIndex + 1;
        this.log(`SWITCHED_TO_API_KEY: ${this.currentKeyIndex + 1}`);
    }

    async searchVideos(keyword) {
        this.log(`SEARCHING: ${keyword}`);
        const orders = ['relevance', 'date', 'viewCount'];
        let allVideos = [];
        
        for (const order of orders) {
            let nextPageToken = null;
            let videosForOrder = [];
            let pageCount = 0;
            
            // Fetch up to 2 pages (100 videos) per order
            while (pageCount < 2) {
                const params = {
                    part: 'snippet',
                    q: keyword,
                    type: 'video',
                    maxResults: 50,
                    order: order,
                    videoCategoryId: 17,
                    videoDuration: 'medium'
                };
                
                if (nextPageToken) {
                    params.pageToken = nextPageToken;
                }
                
                try {
                    const data = await this.apiCall('search', params);
                    this.updateQuota(100); // Each search costs 100 units
                    
                    videosForOrder = [...videosForOrder, ...data.items];
                    nextPageToken = data.nextPageToken;
                    pageCount++;
                    
                    this.log(`FOUND: ${data.items.length} videos for "${keyword}" (${order}, page ${pageCount})`);
                    
                    // Break if no more pages
                    if (!nextPageToken) {
                        break;
                    }
                } catch (error) {
                    this.log(`ERROR: Failed to fetch videos for "${keyword}" (${order}) - ${error.message}`);
                    break;
                }
            }
            
            allVideos = [...allVideos, ...videosForOrder];
        }
        
        this.log(`TOTAL_VIDEOS_FOR "${keyword}": ${allVideos.length}`);
        return allVideos;
    }

    filterSpamVideos(videos) {
        const cleanVideos = [];
        const spamVideos = [];
        
        videos.forEach(video => {
            const title = video.snippet.title.toLowerCase();
            const isSpam = this.spamKeywords.some(keyword => title.includes(keyword));
            (isSpam ? spamVideos : cleanVideos).push(video);
        });
        
        this.log(`FILTERED: ${spamVideos.length} spam videos removed`);
        return { cleanVideos, spamChannels: new Set(spamVideos.map(v => v.snippet.channelId)) };
    }

    async getChannelDetails(channelIds) {
        const chunkSize = 50;
        let channels = [];
        
        for (let i = 0; i < channelIds.length; i += chunkSize) {
            const chunk = channelIds.slice(i, i + chunkSize);
            const data = await this.apiCall('channels', {
                part: 'snippet,statistics',
                id: chunk.join(',')
            });
            this.updateQuota(1);
            channels.push(...(data.items || []));
        }
        
        // Extract contact info from descriptions
        channels.forEach(channel => {
            channel.contacts = this.extractContacts(channel.snippet.description);
        });
        
        return channels;
    }

    // Extract emails and URLs from text (supports multiple languages)
    extractContacts(text) {
        if (!text) return [];
        
        // Robust email regex that supports international characters
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        
        // URL regex that supports international domains
        const urlRegex = /(https?:\/\/[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*)/gi;
        
        const emails = [...new Set((text.match(emailRegex) || []).map(e => e.toLowerCase()))];
        const urls = [...new Set((text.match(urlRegex) || []).map(u => {
            // Normalize URLs
            u = u.toLowerCase();
            if (!u.startsWith('http')) return 'https://' + u;
            return u;
        }))];
        
        // Filter out common non-social URLs
        const socialDomains = [
            'facebook.com', 'fb.com', 'instagram.com', 'instagr.am', 
            'twitter.com', 'x.com', 'tiktok.com', 't.me', 'telegram.me',
            'linkedin.com', 'youtube.com', 'youtu.be', 'pinterest.com',
            'snapchat.com', 'whatsapp.com', 'discord.gg', 'patreon.com',
            'tumblr.com', 'reddit.com', 'twitch.tv'
        ];
        
        const socialUrls = urls.filter(url => 
            socialDomains.some(domain => url.includes(domain))
        );
        
        return [...emails, ...socialUrls];
    }

    async getChannelVideos(channelId) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        let allVideos = [];
        let nextPageToken = null;
        let pageCount = 0;
        
        // Fetch up to 2 pages (100 videos) per channel
        while (pageCount < 2) {
            const params = {
                part: 'snippet',
                channelId: channelId,
                type: 'video',
                maxResults: 50,
                order: 'date',
                publishedAfter: threeMonthsAgo.toISOString()
            };
            
            if (nextPageToken) {
                params.pageToken = nextPageToken;
            }
            
            const data = await this.apiCall('search', params);
            this.updateQuota(100);
            
            allVideos = [...allVideos, ...(data.items || [])];
            nextPageToken = data.nextPageToken;
            pageCount++;
            
            // Break if no more pages
            if (!nextPageToken) {
                break;
            }
        }
        
        return allVideos;
    }

    async getVideoStats(videoIds) {
        if (videoIds.length === 0) return [];
        
        const chunkSize = 50;
        let videos = [];
        
        // Process in parallel
        const chunkPromises = [];
        for (let i = 0; i < videoIds.length; i += chunkSize) {
            const chunk = videoIds.slice(i, i + chunkSize);
            chunkPromises.push(this.apiCall('videos', {
                part: 'statistics,contentDetails,liveStreamingDetails',
                id: chunk.join(',')
            }));
        }
        
        const results = await Promise.all(chunkPromises);
        results.forEach(data => {
            this.updateQuota(1);
            videos.push(...(data.items || []));
        });
        
        return videos;
    }

    parseDuration(duration) {
        if (duration === 'P0D') {
            return 0;
        }
        try {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            const hours = match[1] ? parseInt(match[1]) : 0;
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const seconds = match[3] ? parseInt(match[3]) : 0;
            return hours * 3600 + minutes * 60 + seconds;
        } catch (e) {
            this.log(`DURATION_PARSE_ERROR: ${duration}`);
            return 0;
        }
    }

    detectLives(videos) {
        let hasLive = false;
        let reasons = [];
        
        videos.forEach(video => {
            if (video.contentDetails && video.contentDetails.duration === 'P0D') {
                hasLive = true;
                reasons.push(`P0D duration found - Video ID: ${video.id}`);
            }
            
            if (video.liveStreamingDetails && video.liveStreamingDetails.actualEndTime) {
                hasLive = true;
                reasons.push(`Completed live stream - Video ID: ${video.id}, End time: ${video.liveStreamingDetails.actualEndTime}`);
            }
        });
        
        return { hasLive, reasons };
    }

    calculateMetrics(videos) {
        const longVideos = videos.filter(v => this.parseDuration(v.contentDetails.duration) >= 60);
        if (longVideos.length === 0) return null;
        
        const totalViews = longVideos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || 0), 0);
        const totalLikes = longVideos.reduce((sum, v) => sum + parseInt(v.statistics.likeCount || 0), 0);
        const totalComments = longVideos.reduce((sum, v) => sum + parseInt(v.statistics.commentCount || 0), 0);
        
        const avgViews = Math.round(totalViews / longVideos.length);
        const engagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100) : 0;
        
        return { avgViews, engagement, videoCount: longVideos.length };
    }

    getEngagementClass(engagement) {
        if (engagement === 'N/A') return '';
        return engagement >= 10 ? 'good' : engagement >= 5 ? 'average' : 'poor';
    }

    getRatioClass(ratio) {
        if (ratio === 'N/A') return '';
        return ratio >= 30 ? 'good' : ratio >= 10 ? 'average' : 'poor';
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    renderChannel(channel, metrics, hasLive) {
        const resultsContainer = document.getElementById('results');
        const card = document.createElement('div');
        card.className = 'channel-card';
        
        // Create channel data object
        const channelData = {
            id: channel.id,
            name: channel.snippet.title,
            thumbnail: channel.snippet.thumbnails?.default?.url || '',
            subscribers: parseInt(channel.statistics.subscriberCount || 0),
            avgViews: metrics?.avgViews || 'N/A',
            engagement: metrics?.engagement || 'N/A',
            viewsSubsRatio: metrics ? (metrics.avgViews / parseInt(channel.statistics.subscriberCount || 1) * 100) : 'N/A',
            country: channel.snippet.country || 'N/A',
            url: `https://www.youtube.com/channel/${channel.id}`,
            hasLive: hasLive,
            contacts: channel.contacts || []
        };
        
        this.results.push(channelData);
        
        // Create link
        const link = document.createElement('a');
        link.href = channelData.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'channel-link';
        
        // Format contacts for display
        let contactsHtml = 'N/A';
        if (channelData.contacts.length > 0) {
            contactsHtml = channelData.contacts.map(contact => {
                if (contact.includes('@')) {
                    return `<a href="mailto:${this.escapeHtml(contact)}" target="_blank">${this.escapeHtml(contact)}</a>`;
                } else {
                    return `<a href="${this.escapeHtml(contact)}" target="_blank">${this.escapeHtml(contact)}</a>`;
                }
            }).join(', ');
        }
        
        // Create card content with lives status
        link.innerHTML = `
            <img src="${channel.snippet.thumbnails?.default?.url || ''}" alt="${this.escapeHtml(channel.snippet.title)}" class="channel-img">
            <div class="channel-info">
                <div class="channel-name">${this.escapeHtml(channel.snippet.title)}</div>
                <div class="channel-stats">
                    <div><span class="stat-label">SUBS:</span> <span class="stat-value">${channelData.subscribers.toLocaleString()}</span></div>
                    <div><span class="stat-label">AVG_VIEWS:</span> <span class="stat-value">${channelData.avgViews !== 'N/A' ? channelData.avgViews.toLocaleString() : 'N/A'}</span></div>
                    <div><span class="stat-label">ENGAGEMENT:</span> <span class="stat-value ${this.getEngagementClass(channelData.engagement)}">${channelData.engagement !== 'N/A' ? channelData.engagement.toFixed(2) + '%' : 'N/A'}</span></div>
                    <div><span class="stat-label">V/S_RATIO:</span> <span class="stat-value ${this.getRatioClass(channelData.viewsSubsRatio)}">${channelData.viewsSubsRatio !== 'N/A' ? channelData.viewsSubsRatio.toFixed(2) + '%' : 'N/A'}</span></div>
                    <div><span class="stat-label">COUNTRY:</span> <span class="stat-value">${channelData.country}</span></div>
                    <div><span class="stat-label">LIVES:</span> <span class="stat-value">${hasLive ? 'YES' : 'NO'}</span></div>
                    <div class="stat-full-width"><span class="stat-label">CONTACT:</span> <span class="stat-value">${contactsHtml}</span></div>
                </div>
            </div>
        `;
        
        card.appendChild(link);
        
        // Add to list button
        const listButton = document.createElement('button');
        listButton.className = 'add-to-list';
        listButton.textContent = 'Add to my list';
        listButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleList(channelData, listButton);
        });
        card.appendChild(listButton);
        
        resultsContainer.appendChild(card);
    }

    toggleList(channel, button) {
        const index = window.myListChannels.findIndex(c => c.id === channel.id);
        
        if (index === -1) {
            window.myListChannels.push(channel);
            button.textContent = '✓ Added';
            button.classList.add('added');
            this.log(`ADDED_TO_LIST: ${channel.name}`);
        } else {
            window.myListChannels.splice(index, 1);
            button.textContent = 'Add to my list';
            button.classList.remove('added');
            this.log(`REMOVED_FROM_LIST: ${channel.name}`);
        }
    }

    async analyzeChannel(channel, minViews, filterHasLive) {
        try {
            const videos = await this.getChannelVideos(channel.id);
            if (!videos.length) return;
            
            const videoStats = await this.getVideoStats(videos.map(v => v.id.videoId));
            const liveResult = this.detectLives(videoStats);
            const hasLive = liveResult.hasLive;

            const metrics = this.calculateMetrics(videoStats);
            
            if (!metrics) return;
            
            if (filterHasLive && !hasLive) {
                this.log(`SKIPPED: ${channel.snippet.title} - No lives found`);
                return;
            }
            
            if (metrics.avgViews >= minViews) {
                this.renderChannel(channel, metrics, hasLive);
                this.log(`ADDED: ${channel.snippet.title} - ${metrics.avgViews} avg views`);
            }
        } catch (error) {
            this.log(`ERROR analyzing ${channel.snippet.title}: ${error.message || error}`);
            // Still render channel with N/A metrics
            this.renderChannel(channel, null, false);
        }
    }

    async execute() {
        try {
            this.results = [];
            document.getElementById('results').innerHTML = '';
            
            const keywords = document.getElementById('keywords').value.split(',').map(k => k.trim());
            const minSubs = parseInt(document.getElementById('minSubs').value) || 10000;
            const maxSubs = parseInt(document.getElementById('maxSubs').value) || 200000;
            const minViews = parseInt(document.getElementById('minViews').value) || 1000;
            const filterHasLive = document.getElementById('filterHasLive').checked;
            
            // Get selected countries
            const countryCheckboxes = document.querySelectorAll('#countriesContainer input[type="checkbox"]:checked');
            const countries = Array.from(countryCheckboxes).map(cb => cb.value);
            
            if (!keywords.length) throw new Error('Please enter keywords');
            if (this.apiKeys.length === 0) throw new Error('No API keys configured');
            
            this.updateProgress('INITIALIZING', 0);
            
            // Step 1: Search videos (now gets 300 per keyword)
            let allVideos = [];
            for (let i = 0; i < keywords.length; i++) {
                const videos = await this.searchVideos(keywords[i]);
                allVideos.push(...videos);
                this.updateProgress(`SEARCHING: ${i + 1}/${keywords.length}`, (i + 1) / keywords.length * 20);
            }
            
            // Step 2: Filter spam
            const { cleanVideos, spamChannels } = this.filterSpamVideos(allVideos);
            this.updateProgress('FILTERING_SPAM', 25);
            
            // Step 3: Get unique channels
            const uniqueChannels = [...new Set(cleanVideos.map(v => v.snippet.channelId))]
                .filter(id => !spamChannels.has(id));
            this.log(`FOUND: ${uniqueChannels.length} unique channels`);
            
            // Step 4: Get channel details
            const channels = await this.getChannelDetails(uniqueChannels);
            this.updateProgress('FETCHING_CHANNELS', 40);
            
            // Step 5: Filter by criteria
            const filteredChannels = channels.filter(channel => {
                const subs = parseInt(channel.statistics.subscriberCount || 0);
                const country = channel.snippet.country;
                return subs >= minSubs && subs <= maxSubs && 
                       (countries.length === 0 || countries.includes(country));
            });
            
            this.log(`FILTERED: ${filteredChannels.length} channels match criteria`);
            
            // Step 6: Analyze channels in parallel
            const CONCURRENCY_LIMIT = 5; // Parallel channels to process
            const totalChannels = filteredChannels.length;
            let processed = 0;
            
            for (let i = 0; i < totalChannels; i += CONCURRENCY_LIMIT) {
                const chunk = filteredChannels.slice(i, i + CONCURRENCY_LIMIT);
                await Promise.all(chunk.map(channel => 
                    this.analyzeChannel(channel, minViews, filterHasLive)
                ));
                
                processed += chunk.length;
                const progress = 40 + (processed / totalChannels) * 60;
                this.updateProgress(`ANALYZING: ${processed}/${totalChannels}`, progress);
            }
            
            this.updateProgress('COMPLETE', 100);
            this.log(`FINISHED: Used ${this.quotaUsed} quota points`);
            document.getElementById('exportBtn').disabled = false;
            
            // Save original results and show sort bar
            window.originalResults = [...this.results];
            document.getElementById('sortBar').style.display = 'flex';
            
        } catch (error) {
            this.log(`FATAL_ERROR: ${error.message}`);
            this.updateProgress('ERROR', 0);
        } finally {
            document.getElementById('startBtn').disabled = false;
        }
    }
}

const finder = new CreatorFinder();

// Global list to store user's selections
window.myListChannels = [];
window.originalResults = [];

// Set search mode (advanced or natural language)
function setSearchMode(mode) {
    const advancedBtn = document.getElementById('advancedModeBtn');
    const naturalBtn = document.getElementById('naturalModeBtn');
    const advancedSection = document.getElementById('advancedSearchSection');
    const nlContainer = document.getElementById('nlContainer');
    const editableParams = document.getElementById('editableParams');
    
    if (mode === 'advanced') {
        advancedBtn.classList.add('active');
        naturalBtn.classList.remove('active');
        advancedSection.style.display = 'block';
        nlContainer.style.display = 'none';
        editableParams.style.display = 'none';
    } else {
        advancedBtn.classList.remove('active');
        naturalBtn.classList.add('active');
        advancedSection.style.display = 'none';
        nlContainer.style.display = 'block';
        editableParams.style.display = 'none';
    }
}

// Parse natural language query using Groq Cloud
async function parseNaturalLanguage() {
    const query = document.getElementById('nlQuery').value.trim();
    if (!query) {
        finder.log('ERROR: Please enter a natural language query');
        return;
    }
    
    finder.log(`PROCESSING NATURAL LANGUAGE QUERY: "${query}"`);
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert in parsing natural language queries for a YouTube creator search tool. 
                        The user will provide a description of the type of YouTube creators they are looking for.
                        
                        The tool has the following parameters:
                        - keywords: array of up to 8 relevant search terms (e.g., ['real madrid', 'football news'])
                        - minSubscribers: minimum number of subscribers (if not specified, default is 1000)
                        - maxSubscribers: maximum number of subscribers (if not specified, default is 200000)
                        - minAvgViews: minimum average views per video (if not specified, default is 1000)
                        - countries: array of two-letter country codes (from: US, GB, CA, AU, DE, FR, ES, IN, PK). If not specified, leave empty meaning all countries.
                        - hasLive: boolean indicating whether to filter for channels that have done live streams in the last 3 months.
                        
                        You must respond with a valid JSON object only, with this exact structure:
                        {
                          "keywords": [],
                          "minSubscribers": null,
                          "maxSubscribers": null,
                          "minAvgViews": null,
                          "countries": [],
                          "hasLive": false
                        }
                        
                        Fill in the values based on the user's query. Use your knowledge to infer the appropriate values.
                        Do not include any text before or after the JSON object. Remember to give intellgent and not overly generic keywords.KEYWORDS SHOULD BE ALL RELATED TO THE MAIN SUBJECT OF THE QUERY. GIVE 8 KEYWORDS. Please give keywords mostly relevant to the news and context of 2025.
                        
                        Example: 
                          Query: "find me real madrid streamers from spain mid range"
                          Response: 
                            {
                              "keywords": ["real madrid", "real madrid transfers", "real madrid news", "xabi alonso", "la liga"],
                              "minSubscribers": 5000,
                              "maxSubscribers": 100000,
                              "minAvgViews": 1000,
                              "countries": ["ES"],
                              "hasLive": true
                            }`
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                temperature: 0.8,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        let jsonResponse;
        
        try {
            // Extract JSON from the response content
            const content = data.choices[0].message.content.trim();
            
            // Try to parse the content as JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonResponse = JSON.parse(jsonMatch[0]);
            } else {
                jsonResponse = JSON.parse(content);
            }
        } catch (parseError) {
            finder.log(`ERROR parsing JSON response: ${parseError.message}`);
            finder.log(`Raw response: ${data.choices[0].message.content}`);
            return;
        }
        
        // Validate and set the parameters
        setParametersFromAI(jsonResponse);
        
        // Populate editable parameters
        populateEditableParams(jsonResponse);
        
        // Show the editable parameters section
        document.getElementById('editableParams').style.display = 'block';
        
        finder.log('AI successfully parsed natural language query');
    } catch (error) {
        finder.log(`ERROR parsing natural language: ${error.message}`);
        console.error('Full error details:', error);
    }
}

// Set parameters based on AI response
function setParametersFromAI(aiParams) {
    // Set keywords
    if (aiParams.keywords && aiParams.keywords.length > 0) {
        document.getElementById('keywords').value = aiParams.keywords.join(', ');
    }
    
    // Set subscriber range
    if (aiParams.minSubscribers !== null && aiParams.minSubscribers !== undefined) {
        document.getElementById('minSubs').value = aiParams.minSubscribers;
    }
    if (aiParams.maxSubscribers !== null && aiParams.maxSubscribers !== undefined) {
        document.getElementById('maxSubs').value = aiParams.maxSubscribers;
    }
    
    // Set min views
    if (aiParams.minAvgViews !== null && aiParams.minAvgViews !== undefined) {
        document.getElementById('minViews').value = aiParams.minAvgViews;
    }
    
    // Set countries
    const countryCheckboxes = document.querySelectorAll('#countriesContainer input[type="checkbox"]');
    countryCheckboxes.forEach(checkbox => {
        checkbox.checked = aiParams.countries && aiParams.countries.includes(checkbox.value);
    });
    
    // Set live stream filter
    document.getElementById('filterHasLive').checked = aiParams.hasLive === true;
}

// Populate editable parameters from AI response
function populateEditableParams(aiParams) {
    const keywordsContainer = document.getElementById('keywordsContainer');
    keywordsContainer.innerHTML = '';
    
    // Add keywords as tags
    if (aiParams.keywords && aiParams.keywords.length > 0) {
        aiParams.keywords.forEach(keyword => {
            const tag = document.createElement('div');
            tag.className = 'keyword-tag';
            tag.innerHTML = `
                ${keyword}
                <span class="remove-keyword" onclick="removeKeyword(this)">×</span>
            `;
            keywordsContainer.appendChild(tag);
        });
    }
    
    // Set other parameters
    document.getElementById('editableMinSubs').value = 
        aiParams.minSubscribers !== null && aiParams.minSubscribers !== undefined 
        ? aiParams.minSubscribers 
        : 1000;
        
    document.getElementById('editableMaxSubs').value = 
        aiParams.maxSubscribers !== null && aiParams.maxSubscribers !== undefined 
        ? aiParams.maxSubscribers 
        : 200000;
        
    document.getElementById('editableMinViews').value = 
        aiParams.minAvgViews !== null && aiParams.minAvgViews !== undefined 
        ? aiParams.minAvgViews 
        : 1000;
        
    document.getElementById('editableHasLive').checked = 
        aiParams.hasLive === true;
        
    // Set countries as comma-separated string
    document.getElementById('editableCountries').value = 
        aiParams.countries && aiParams.countries.length > 0 
        ? aiParams.countries.join(', ') 
        : '';
}

// Add keyword to editable parameters
function addKeyword() {
    const keywordInput = document.getElementById('newKeyword');
    const keyword = keywordInput.value.trim();
    
    if (keyword) {
        const keywordsContainer = document.getElementById('keywordsContainer');
        
        // Create keyword tag
        const tag = document.createElement('div');
        tag.className = 'keyword-tag';
        tag.innerHTML = `
            ${keyword}
            <span class="remove-keyword" onclick="removeKeyword(this)">×</span>
        `;
        
        keywordsContainer.appendChild(tag);
        keywordInput.value = '';
    }
}

// Remove keyword from editable parameters
function removeKeyword(element) {
    element.parentElement.remove();
}

// Update parameters and start search
function updateAndSearch() {
    // Collect keywords
    const keywordTags = document.querySelectorAll('.keyword-tag');
    const keywords = Array.from(keywordTags).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
    
    // Update advanced search form
    document.getElementById('keywords').value = keywords.join(', ');
    document.getElementById('minSubs').value = document.getElementById('editableMinSubs').value;
    document.getElementById('maxSubs').value = document.getElementById('editableMaxSubs').value;
    document.getElementById('minViews').value = document.getElementById('editableMinViews').value;
    document.getElementById('filterHasLive').checked = document.getElementById('editableHasLive').checked;
    
    // Update countries in advanced search
    const countryCodes = document.getElementById('editableCountries').value
        .split(',')
        .map(code => code.trim().toUpperCase());
        
    const countryCheckboxes = document.querySelectorAll('#countriesContainer input[type="checkbox"]');
    countryCheckboxes.forEach(checkbox => {
        checkbox.checked = countryCodes.includes(checkbox.value);
    });
    
    // Start the search
    startFinder();
}

// Sort results based on selected criteria
function sortResults() {
    const sortBy = document.getElementById('sortSelect').value;
    const direction = document.getElementById('sortDirection').value;
    
    if (sortBy === 'default') {
        // Return to original order
        finder.results = [...window.originalResults];
        renderResults();
        return;
    }
    
    // Sort the results
    finder.results.sort((a, b) => {
        let valA, valB;
        
        switch(sortBy) {
            case 'subscribers':
                valA = a.subscribers;
                valB = b.subscribers;
                break;
            case 'country':
                valA = a.country || 'ZZZ'; // Push "N/A" to bottom
                valB = b.country || 'ZZZ';
                break;
            case 'avgViews':
                valA = a.avgViews === 'N/A' ? -1 : a.avgViews;
                valB = b.avgViews === 'N/A' ? -1 : b.avgViews;
                break;
            case 'engagement':
                valA = a.engagement === 'N/A' ? -1 : a.engagement;
                valB = b.engagement === 'N/A' ? -1 : b.engagement;
                break;
            default:
                return 0;
        }
        
        // Handle different value types
        if (typeof valA === 'string' && typeof valB === 'string') {
            return direction === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        } else {
            return direction === 'asc' 
                ? valA - valB 
                : valB - valA;
        }
    });
    
    renderResults();
}

// Render sorted results
function renderResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    finder.results.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        
        // Format contacts for display
        let contactsHtml = 'N/A';
        if (channel.contacts.length > 0) {
            contactsHtml = channel.contacts.map(contact => {
                if (contact.includes('@')) {
                    return `<a href="mailto:${contact}" target="_blank">${contact}</a>`;
                } else {
                    return `<a href="${contact}" target="_blank">${contact}</a>`;
                }
            }).join(', ');
        }
        
        card.innerHTML = `
            <a href="${channel.url}" target="_blank" class="channel-link">
                <img src="${channel.thumbnail}" alt="${channel.name}" class="channel-img">
                <div class="channel-info">
                    <div class="channel-name">${channel.name}</div>
                    <div class="channel-stats">
                        <div><span class="stat-label">SUBS:</span> <span class="stat-value">${channel.subscribers.toLocaleString()}</span></div>
                        <div><span class="stat-label">COUNTRY:</span> <span class="stat-value">${channel.country || 'N/A'}</span></div>
                        <div><span class="stat-label">AVG_VIEWS:</span> <span class="stat-value">${channel.avgViews !== 'N/A' ? channel.avgViews.toLocaleString() : 'N/A'}</span></div>
                        <div><span class="stat-label">ENGAGEMENT:</span> <span class="stat-value">${channel.engagement !== 'N/A' ? channel.engagement.toFixed(2) + '%' : 'N/A'}</span></div>
                        <div class="stat-full-width"><span class="stat-label">CONTACT:</span> <span class="stat-value">${contactsHtml}</span></div>
                    </div>
                </div>
            </a>
            <button class="add-to-list">Add to my list</button>
        `;
        
        resultsContainer.appendChild(card);
    });
}

async function startFinder() {
    document.getElementById('startBtn').disabled = true;
    document.getElementById('exportBtn').disabled = true;
    document.getElementById('sortBar').style.display = 'none';
    finder.quotaUsed = 0;
    finder.results = [];
    await finder.execute();
}

function showExportModal() {
    document.getElementById('exportModal').style.display = 'block';
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

function exportCSV() {
    const columns = {
        col_name: 'Channel Name',
        col_subs: 'Subscribers', 
        col_views: 'Avg Views',
        col_engagement: 'Engagement Rate (%)',
        col_ratio: 'Views/Subs Ratio (%)',
        col_country: 'Country',
        col_hasLive: 'Has Lives',
        col_link: 'Channel Link',
        col_contacts: 'Contact Info'
    };
    
    const selectedCols = Object.keys(columns).filter(col => 
        document.getElementById(col).checked
    );
    
    if (selectedCols.length === 0) {
        alert('Please select at least one column');
        return;
    }
    
    // Get export source
    const exportSource = document.querySelector('input[name="exportSource"]:checked').value;
    const dataToExport = exportSource === 'all' ? finder.results : window.myListChannels;
    
    if (dataToExport.length === 0) {
        alert(`No data available to export from ${exportSource === 'all' ? 'database' : 'your list'}`);
        return;
    }
    
    let csv = selectedCols.map(col => columns[col]).join(',') + '\n';
    
    dataToExport.forEach(channel => {
        const row = selectedCols.map(col => {
            switch(col) {
                case 'col_name': return `"${channel.name}"`;
                case 'col_subs': return channel.subscribers;
                case 'col_views': return channel.avgViews;
                case 'col_engagement': return channel.engagement;
                case 'col_ratio': return channel.viewsSubsRatio;
                case 'col_country': return channel.country;
                case 'col_hasLive': return channel.hasLive ? 'Yes' : 'No';
                case 'col_link': return channel.url;
                case 'col_contacts': return channel.contacts ? `"${channel.contacts.join(', ')}"` : ''; 
                default: return '';
            }
        }).join(',');
        csv += row + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator_finder_${new Date().toISOString().split('T')[0]}_${exportSource}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    closeExportModal();
}

// Initialize the UI with advanced search as default
setSearchMode('advanced');