// ============================================
// NewsGuard Platform — Application Logic
// ============================================

// Core Local State & Default Database
let newsDatabase = [
    {
        id: 1,
        title: "Global Semiconductor Supply Stabilizes as New Fabrication Plants Come Online in Q2",
        category: "Technology",
        source: "TechWire Global",
        timestamp: "Today, 14:42",
        summary: "Recent industry telemetry reports indicate a 22% increase in microchip wafer production across European and North American facilities, easing supply constraints.",
        fullText: "Global semiconductor manufacturing output has recorded a significant rebound following the commissioning of three major fabrication facilities in Dresden, Phoenix, and Dublin. Industry analysts note that supply chain bottlenecks have substantially receded.",
        sourcesCount: 14,
        primarySourceAvailable: true,
        conflictingReports: 1,
        claimStatus: "Supported by multiple sources",
        confidence: "High (96.4%)",
        lastChecked: "15:42",
        verificationReport: {
            extractedClaims: [
                { claim: "Semiconductor production increased by 22% in Q2", status: "Verified", confidence: "98%", sources: ["TechWire Global", "Reuters", "Bloomberg Tech"] },
                { claim: "Automotive delivery schedules normalized", status: "Partially Confirmed", confidence: "89%", sources: ["Automotive News Europe"] }
            ],
            crossSourceComparison: "Cross-referenced across 14 independent RSS feeds and wire services. 1 conflicting report from a regional trade blog regarding raw silicon wafer shortages.",
            sourceTransparency: "Primary source documents verified via official European Commission Industry Press Release #4029."
        }
    },
    {
        id: 2,
        title: "International Climate Summit Agrees on New Methane Reduction Framework for Energy Sector",
        category: "Global Affairs",
        source: "Global Dispatch",
        timestamp: "Today, 13:15",
        summary: "Delegates from 45 industrial nations have finalized a binding framework requiring upstream energy operators to deploy continuous satellite monitoring for methane leaks.",
        fullText: "Following five days of intense negotiations, the Geneva Climate Accord committee successfully ratified the Methane Abatement Enforcement Protocol. The treaty mandates real-time telemetry sharing for all oil and gas extraction sites.",
        sourcesCount: 22,
        primarySourceAvailable: true,
        conflictingReports: 0,
        claimStatus: "Supported by multiple sources",
        confidence: "Very High (99.1%)",
        lastChecked: "15:30",
        verificationReport: {
            extractedClaims: [
                { claim: "45 industrial nations ratified the protocol", status: "Verified", confidence: "100%", sources: ["UN Climate Press", "Global Dispatch", "AP News"] },
                { claim: "Mandatory satellite monitoring starting next year", status: "Verified", confidence: "98%", sources: ["Reuters", "AFP"] }
            ],
            crossSourceComparison: "Unanimous corroboration across 22 accredited diplomatic wire agencies and official UN press briefings.",
            sourceTransparency: "Verified against official UN Treaty Section Document Ref: UNEP/MC/COP6/12."
        }
    },
    {
        id: 3,
        title: "Central Bank Maintains Benchmark Interest Rate Amid Strong Employment Figures",
        category: "Economy",
        source: "Financial Wire",
        timestamp: "Today, 09:30",
        summary: "Federal Reserve officials voted unanimously to hold the federal funds rate steady, citing persistent service sector growth and resilient labor markets.",
        fullText: "In accordance with consensus expectations, the Federal Open Market Committee announced it would maintain its benchmark interest rate within the current target range.",
        sourcesCount: 18,
        primarySourceAvailable: true,
        conflictingReports: 0,
        claimStatus: "Supported by multiple sources",
        confidence: "Very High (99.8%)",
        lastChecked: "15:00",
        verificationReport: {
            extractedClaims: [
                { claim: "Unanimous vote to hold interest rates", status: "Verified", confidence: "100%", sources: ["Federal Reserve Official Statement", "Bloomberg", "Financial Wire"] },
                { claim: "Labor market resilience cited as primary factor", status: "Verified", confidence: "99%", sources: ["Wall Street Journal", "Reuters"] }
            ],
            crossSourceComparison: "Directly corroborated by official central bank press release and live broadcast transcripts.",
            sourceTransparency: "Primary source document verified via Federal Reserve Board Press Release #2026-041."
        }
    }
];

let sourcesList = [
    { name: "Reuters Wire API", tier: "Tier 1 (Official Wire / Primary)", url: "https://api.reuters.com/rss/v2", status: "Active (20ms)" },
    { name: "Associated Press RSS", tier: "Tier 1 (Official Wire / Primary)", url: "https://rss.apnews.com/latest", status: "Active (35ms)" },
    { name: "Bloomberg Technology Feed", tier: "Tier 2 (Accredited Publisher)", url: "https://www.bloomberg.com/technology/rss", status: "Active (48ms)" },
    { name: "UN Climate Press Portal", tier: "Tier 1 (Official Wire / Primary)", url: "https://unfccc.int/rss.xml", status: "Active (60ms)" }
];

let currentFilter = 'all';
let searchQuery = '';

// DOM Loaded Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadSavedState();
    renderArticles();
    renderSources();
});

// Local Storage State Management
function saveState() {
    try {
        localStorage.setItem('newsguard_articles', JSON.stringify(newsDatabase));
        localStorage.setItem('newsguard_sources', JSON.stringify(sourcesList));
    } catch (e) {
        console.error("Local storage save failed", e);
    }
}

function loadSavedState() {
    try {
        const savedArticles = localStorage.getItem('newsguard_articles');
        const savedSources = localStorage.getItem('newsguard_sources');
        if (savedArticles) newsDatabase = JSON.parse(savedArticles);
        if (savedSources) sourcesList = JSON.parse(savedSources);
    } catch (e) {
        console.error("Local storage load failed", e);
    }
}

// Tab Switching Logic
function switchTab(tabId) {
    ['dashboard', 'workspace', 'inspector', 'sources'].forEach(t => {
        document.getElementById(`view-${t}`).classList.add('hidden');
        const navBtn = document.getElementById(`nav-${t}`);
        if(navBtn) {
            navBtn.className = "px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white";
        }
    });

    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    const activeNav = document.getElementById(`nav-${tabId}`);
    if(activeNav) {
        activeNav.className = "px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm";
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Articles Feed with Filter & Search
function renderArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';

    let filtered = newsDatabase;
    if (currentFilter !== 'all') {
        filtered = filtered.filter(a => a.category === currentFilter);
    }
    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.summary.toLowerCase().includes(q) || 
            a.source.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-16 text-center space-y-3 glass-panel rounded-3xl">
                <i class="fa-solid fa-folder-open text-4xl text-slate-400"></i>
                <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">No matching news articles found</h3>
                <p class="text-xs text-slate-500">Try adjusting your search query or ingest a new article in the workspace.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(article => {
        const card = document.createElement('div');
        card.className = "glass-panel p-6 rounded-3xl shadow-md border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all";
        
        card.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">${article.category}</span>
                    <span class="text-xs text-slate-400 flex items-center"><i class="fa-regular fa-clock mr-1"></i>${article.timestamp}</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors cursor-pointer" onclick="openArticleModal(${article.id})">${article.title}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${article.summary}</p>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                    <span><i class="fa-solid fa-newspaper mr-1 text-brand-500"></i> ${article.source}</span>
                    <span>&bull;</span>
                    <span><i class="fa-solid fa-network-wired mr-1 text-purple-500"></i> ${article.sourcesCount} reporting sources</span>
                </div>
            </div>

            <!-- Signature Support Statement Card -->
            <div class="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span class="flex items-center text-brand-600 dark:text-brand-400"><i class="fa-solid fa-shield-check mr-1.5"></i>NewsGuard Support Statement</span>
                    <span class="text-slate-400 font-normal">Last checked: ${article.lastChecked}</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="block text-slate-400 text-[10px] uppercase font-semibold">Claim Status</span>
                        <span class="font-bold text-emerald-600 dark:text-emerald-400 truncate block">${article.claimStatus}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="block text-slate-400 text-[10px] uppercase font-semibold">Confidence</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">${article.confidence}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="block text-slate-400 text-[10px] uppercase font-semibold">Primary Source</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">${article.primarySourceAvailable ? 'Yes (Verified)' : 'No'}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="block text-slate-400 text-[10px] uppercase font-semibold">Conflicting</span>
                        <span class="font-bold ${article.conflictingReports > 0 ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'}">${article.conflictingReports} report(s)</span>
                    </div>
                </div>
                <div class="pt-1 flex items-center justify-between">
                    <button onclick="openArticleModal(${article.id})" class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center">
                        View Full Verification Report <i class="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                    <button onclick="deleteArticle(${article.id})" class="text-xs text-rose-500 hover:text-rose-700" title="Delete Article">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Update stats
    document.getElementById('stat-articles').textContent = (1428 + newsDatabase.length - 3);
    document.getElementById('stat-sources').textContent = `${sourcesList.length + 47} Active`;
}

function filterNews(category) {
    currentFilter = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.className = "category-btn px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-all";
    });
    event.target.className = "category-btn px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white transition-all shadow-sm";
    renderArticles();
}

function handleSearch() {
    searchQuery = document.getElementById('search-input').value;
    renderArticles();
}

// Interactive Workspace Pipeline Simulation
function runPipelineWorkspace() {
    const title = document.getElementById('ingest-title').value.trim();
    const category = document.getElementById('ingest-category').value;
    const source = document.getElementById('ingest-source').value.trim() || "User Workspace";
    const body = document.getElementById('ingest-body').value.trim();
    const url = document.getElementById('ingest-url').value.trim();

    if (!title || !body) {
        showToast("Please provide both an article title and body text.", "error");
        return;
    }

    const progressBox = document.getElementById('pipeline-progress-box');
    progressBox.classList.remove('hidden');
    progressBox.scrollIntoView({ behavior: 'smooth' });

    const steps = [
        "Step 1: Ingesting RSS / News APIs...",
        "Step 2: Cleaning Article Content & Metadata...",
        "Step 3: Running Locality-Sensitive Duplicate Detection...",
        "Step 4: Grouping into Dynamic News Clusters...",
        "Step 5: NLP Claim Extraction & NER...",
        "Step 6: Cross-Source Comparison & Evidence Match...",
        "Step 7: Fact & Source Provenance Verification...",
        "Step 8: Generating Verification Report & Support Statement...",
        "Step 9: Publishing to User Dashboard..."
    ];

    let currentStep = 0;
    const statusTitle = document.getElementById('pipeline-status-title');
    const progressBar = document.getElementById('pipeline-bar');
    const percentage = document.getElementById('pipeline-percentage');
    const stepsList = document.getElementById('pipeline-steps-list');

    stepsList.innerHTML = '';
    steps.forEach((s, idx) => {
        stepsList.innerHTML += `<div id="p-step-${idx}" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium flex items-center space-x-2">
            <i class="fa-solid fa-circle text-[8px]"></i><span>${s.split(':')[0]}</span>
        </div>`;
    });

    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            statusTitle.textContent = steps[currentStep];
            const pct = Math.round(((currentStep + 1) / steps.length) * 100);
            progressBar.style.width = `${pct}%`;
            percentage.textContent = `${pct}%`;

            const activeEl = document.getElementById(`p-step-${currentStep}`);
            if (activeEl) {
                activeEl.className = "p-2.5 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center space-x-2 border border-brand-500/30";
                activeEl.innerHTML = `<i class="fa-solid fa-check text-brand-500"></i><span>${steps[currentStep].split(':')[0]}</span>`;
            }
            currentStep++;
        } else {
            clearInterval(interval);
            // Add new article to database
            const newArticle = {
                id: Date.now(),
                title: title,
                category: category,
                source: source,
                timestamp: "Just now",
                summary: body.length > 140 ? body.substring(0, 140) + "..." : body,
                fullText: body,
                sourcesCount: Math.floor(Math.random() * 10) + 5,
                primarySourceAvailable: true,
                conflictingReports: 0,
                claimStatus: "Supported by multiple sources",
                confidence: "High (95.2%)",
                lastChecked: "Just now",
                verificationReport: {
                    extractedClaims: [
                        { claim: title.substring(0, 60) + "...", status: "Verified", confidence: "96%", sources: [source, "Reuters Wire", "AP News"] }
                    ],
                    crossSourceComparison: `Cross-referenced successfully against active RSS feeds and wire services. Target URL: ${url || 'Direct Text Ingestion'}`,
                    sourceTransparency: "Source provenance cryptographically verified via NewsGuard Pipeline Engine."
                }
            };

            newsDatabase.unshift(newArticle);
            saveState();
            renderArticles();

            showToast("Article successfully ingested and verified!");
            setTimeout(() => {
                switchTab('dashboard');
            }, 1000);
        }
    }, 400);
}

// AI Claim Inspector
const presetClaims = [
    "Global semiconductor manufacturing output increased by 22% in Q2 according to recent trade union disclosures.",
    "Central Bank announces unexpected emergency interest rate hike of 75 basis points.",
    "Clinical trials confirm 98% efficacy for new synthetic biology mRNA vaccine."
];

function loadPresetClaim(index) {
    document.getElementById('inspector-input').value = presetClaims[index];
    showToast("Preset claim loaded into AI Inspector.");
}

function runClaimInspection() {
    const inputVal = document.getElementById('inspector-input').value.trim();
    if (!inputVal) {
        showToast("Please enter or select a news claim first.", "error");
        return;
    }

    const resultsContainer = document.getElementById('inspector-results');
    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = `
        <div class="glass-panel p-8 rounded-3xl text-center space-y-4 ai-glow">
            <div class="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-500 flex items-center justify-center mx-auto text-xl animate-spin">
                <i class="fa-solid fa-spinner"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Running NewsGuard AI Verification Pipeline...</h3>
            <p class="text-xs text-slate-500">Classifying statement, deduplicating with live feeds, and evaluating source provenance...</p>
        </div>
    `;

    setTimeout(() => {
        resultsContainer.innerHTML = `
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-brand-500/30 shadow-xl">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                            <i class="fa-solid fa-circle-check mr-1.5"></i>Verification Complete
                        </span>
                        <h3 class="text-xl font-extrabold text-slate-900 dark:text-white mt-2">AI Inspector Report</h3>
                    </div>
                    <div class="text-right">
                        <span class="block text-xs text-slate-400 uppercase font-semibold">Confidence Score</span>
                        <span class="text-2xl font-black text-brand-600 dark:text-brand-400">95.4% (High)</span>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Analyzed Claim Statement</span>
                        <p class="text-sm font-medium text-slate-800 dark:text-slate-200 italic">"${inputVal}"</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                            <span class="text-[11px] font-bold uppercase text-slate-400">Classification</span>
                            <span class="block text-sm font-bold text-slate-800 dark:text-slate-200">Verified Factual Assertion</span>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                            <span class="text-[11px] font-bold uppercase text-slate-400">Cluster Match</span>
                            <span class="block text-sm font-bold text-emerald-600">Event Cluster #420</span>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                            <span class="text-[11px] font-bold uppercase text-slate-400">Source Provenance</span>
                            <span class="block text-sm font-bold text-brand-600">14 Independent Wires</span>
                        </div>
                    </div>

                    <!-- Support Statement Output -->
                    <div class="bg-brand-500/10 dark:bg-brand-950/40 rounded-2xl p-4 border border-brand-500/30 space-y-2">
                        <div class="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center">
                            <i class="fa-solid fa-shield-halved mr-1.5"></i>Support Statement Output
                        </div>
                        <p class="text-xs text-slate-700 dark:text-slate-300">
                            Claim status: <strong>Supported by multiple sources</strong> &bull; Confidence: <strong>High</strong> &bull; Primary source available: <strong>Yes</strong> &bull; Conflicting reports: <strong>0</strong> &bull; Last checked: <strong>Just now</strong>
                        </p>
                    </div>
                </div>
            </div>
        `;
        showToast("Claim successfully verified by AI Inspector.");
    }, 1000);
}

// News Sources Management
function renderSources() {
    const list = document.getElementById('sources-list');
    list.innerHTML = '';

    sourcesList.forEach((src, idx) => {
        list.innerHTML += `
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div class="space-y-1">
                    <div class="font-bold text-slate-900 dark:text-white text-sm">${src.name}</div>
                    <div class="text-slate-400">${src.tier} &bull; <span class="text-brand-600 font-mono">${src.url}</span></div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-600">${src.status}</span>
                    <button onclick="removeSource(${idx})" class="text-rose-500 hover:text-rose-700 p-1"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function addNewSource() {
    const name = document.getElementById('source-name').value.trim();
    const tier = document.getElementById('source-tier').value;
    const url = document.getElementById('source-url').value.trim();

    if (!name || !url) {
        showToast("Please provide both source name and feed URL.", "error");
        return;
    }

    sourcesList.push({ name, tier, url, status: "Active (18ms)" });
    saveState();
    renderSources();

    document.getElementById('source-name').value = '';
    document.getElementById('source-url').value = '';
    showToast("New news source registered and connected successfully!");
}

function removeSource(index) {
    sourcesList.splice(index, 1);
    saveState();
    renderSources();
    showToast("News source removed.");
}

// Article Modal Details
function openArticleModal(id) {
    const article = newsDatabase.find(a => a.id === id);
    if (!article) return;

    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center space-x-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">${article.category}</span>
                <span class="text-xs text-slate-400">&bull;</span>
                <span class="text-xs text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${article.timestamp}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">${article.title}</h2>
            <div class="text-xs font-semibold text-slate-500 flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span><i class="fa-solid fa-newspaper mr-1 text-brand-500"></i> ${article.source}</span>
                <span>&bull;</span>
                <span><i class="fa-solid fa-network-wired mr-1 text-purple-500"></i> Corroborated across ${article.sourcesCount} sources</span>
            </div>
            <div class="text-slate-700 dark:text-slate-300 text-base leading-relaxed space-y-4">
                <p>${article.fullText}</p>
            </div>

            <!-- Full Verification Report Breakdown -->
            <div class="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4 mt-6">
                <h4 class="font-bold text-slate-900 dark:text-white flex items-center text-sm uppercase tracking-wider">
                    <i class="fa-solid fa-file-shield text-brand-500 mr-2"></i>NewsGuard Verification Dossier
                </h4>
                <div class="space-y-3">
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase">Extracted Claims & Status</span>
                        <div class="mt-2 space-y-2">
                            ${article.verificationReport.extractedClaims.map(c => `
                                <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                    <span class="font-semibold text-slate-800 dark:text-slate-200">${c.claim}</span>
                                    <div class="flex items-center space-x-2 shrink-0">
                                        <span class="px-2 py-0.5 rounded-md font-bold ${c.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}">${c.status} (${c.confidence})</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase">Cross-Source Comparison</span>
                        <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">${article.verificationReport.crossSourceComparison}</p>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase">Source Transparency & Provenance</span>
                        <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">${article.verificationReport.sourceTransparency}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('article-modal').classList.remove('hidden');
}

function closeArticleModal() {
    document.getElementById('article-modal').classList.add('hidden');
}

function deleteArticle(id) {
    newsDatabase = newsDatabase.filter(a => a.id !== id);
    saveState();
    renderArticles();
    showToast("Article deleted from dashboard.");
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Dark Mode Toggle
function toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    showToast(isDark ? "Switched to Dark Mode" : "Switched to Light Mode");
}

// Toast Notification Helper
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    toastMsg.textContent = message;
    if (type === 'error') {
        toastIcon.className = "fa-solid fa-circle-exclamation text-amber-400 text-lg";
    } else {
        toastIcon.className = "fa-solid fa-circle-check text-brand-400 text-lg";
    }

    toast.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
    }, 3500);
}
