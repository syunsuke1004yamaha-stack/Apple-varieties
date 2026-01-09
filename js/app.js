/**
 * りんごの品種 - メインロジック
 * 全Apple製品の検索をサポートする汎用実装
 */

// グローバル変数: 現在のデバイスタイプ (デフォルト: iphone)
let currentDevice = 'iphone';

/**
 * デバイス設定・定義
 * 各デバイスのデータソース、フィルター条件、計算プロパティなどを定義
 */
const DEVICE_CONFIG = {
    iphone: {
        dataVar: 'IPHONE_DATA',
        label: 'iPhone',
        filters: ['CPU'], // 既存機能維持
        placeholderModel: '例: A1723',
        placeholderName: '例: iPhone SE'
    },
    ipad: {
        dataVar: 'IPAD_DATA',
        label: 'iPad',
        filters: ['シリーズ', 'CPU'], // iPad Pro, Air, etc. + CPU added
        placeholderModel: '例: A2925',
        placeholderName: '例: iPad Pro',
        computedProps: {
            'CPU': (item) => {
                const features = item['特徴'];
                if (!features) return '不明';
                // Mシリーズ (M1, M2, M4 etc)
                const mMatch = features.match(/M\d+/);
                if (mMatch) return `${mMatch[0]} チップ`;

                // Aシリーズ (A12Z, A12X, A15 Bionic etc)
                // A[数字] + (X/Z)? + (Bionic/Fusion)?
                const aMatch = features.match(/A\d+([XZ])?(\s+(Bionic|Fusion))?/);
                if (aMatch) return `${aMatch[0]} チップ`;

                // Aシリーズ単体 (A10, A9 etc) - 上記でカバーしきれないシンプルな表記
                const aSimpleMatch = features.match(/A\d+/);
                if (aSimpleMatch) return `${aSimpleMatch[0]} チップ`;

                return '不明';
            }
        }
    },
    airpods: {
        dataVar: 'AIRPODS_DATA',
        label: 'AirPods',
        filters: ['シリーズ'], // Pro, Max, 無印
        placeholderModel: '例: A2096',
        placeholderName: '例: AirPods Pro',
        computedProps: {
            'シリーズ': (item) => {
                const name = item['名称'];
                if (name.includes('Max')) return 'AirPods Max';
                if (name.includes('Pro')) return 'AirPods Pro';
                return 'AirPods';
            }
        }
    },
    apple_tv: {
        dataVar: 'APPLE_TV_DATA',
        label: 'Apple TV',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A1625',
        placeholderName: '例: Apple TV 4K'
    },
    apple_watch: {
        dataVar: 'APPLE_WATCH_DATA',
        label: 'Apple Watch',
        filters: ['シリーズ', '発売年'], // Series X, SE, Ultra
        placeholderModel: '例: A2980',
        placeholderName: '例: Series 9',
        computedProps: {
            'シリーズ': (item) => {
                const name = item['名称'];
                if (name.includes('Ultra')) return 'Apple Watch Ultra';
                if (name.includes('SE')) return 'Apple Watch SE';
                if (name.includes('Series')) {
                    // "Apple Watch Series 9" -> "Series 9" とするか、ナンバリングだけにするか
                    // 要件: "ナンバリングのシリーズ（7,10など）"
                    const match = name.match(/Series\s*(\d+)/);
                    if (match) return `Series ${match[1]}`;

                    // 日本語表記などの揺らぎ対応
                    const matchJP = name.match(/Series\s*([０-９]+)/);
                    if (matchJP) return `Series ${matchJP[1]}`;

                    return 'Series';
                }
                if (name.includes('第1世代') || name === 'Apple Watch') return '初代 / Series 1';
                return 'Other';
            }
        }
    },
    homepod: {
        dataVar: 'HOMEPOD_DATA',
        label: 'HomePod',
        filters: ['発売年'],
        placeholderModel: '例: A2384',
        placeholderName: '例: HomePod mini'
    },
    imac: {
        dataVar: 'IMAC_DATA',
        label: 'iMac',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A2438',
        placeholderName: '例: iMac M3'
    },
    ipod: {
        dataVar: 'IPOD_DATA',
        label: 'iPod',
        filters: ['シリーズ', '発売年'],
        placeholderModel: '例: A1238',
        placeholderName: '例: iPod classic',
        computedProps: {
            'シリーズ': (item) => {
                const name = item['名称'].toLowerCase();
                if (name.includes('touch')) return 'iPod touch';
                if (name.includes('nano')) return 'iPod nano';
                if (name.includes('shuffle')) return 'iPod shuffle';
                if (name.includes('mini')) return 'iPod mini';
                if (name.includes('classic') || name.match(/第\d+世代/)) return 'iPod classic / Original'; // 初期の無印含む
                return 'Other';
            }
        }
    },
    mac_mini: {
        dataVar: 'MAC_MINI_DATA',
        label: 'Mac mini',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A2686',
        placeholderName: '例: Mac mini M2'
    },
    mac_pro: {
        dataVar: 'MAC_PRO_DATA',
        label: 'Mac Pro',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A2786',
        placeholderName: '例: Mac Pro'
    },
    mac_studio: {
        dataVar: 'MAC_STUDIO_DATA',
        label: 'Mac Studio',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A2901',
        placeholderName: '例: Mac Studio'
    },
    macbook_air: {
        dataVar: 'MACBOOK_AIR_DATA',
        label: 'MacBook Air',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A3113',
        placeholderName: '例: MacBook Air M3'
    },
    macbook_pro: {
        dataVar: 'MACBOOK_PRO_DATA',
        label: 'MacBook Pro',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A2992',
        placeholderName: '例: MacBook Pro 14-inch'
    },
    macbook: {
        dataVar: 'MACBOOK_DATA',
        label: 'MacBook',
        filters: ['CPU', '発売年'],
        placeholderModel: '例: A1534',
        placeholderName: '例: MacBook (Retina)'
    }
};

// データのキャッシュ
const DATA_CACHE = {};

document.addEventListener('DOMContentLoaded', () => {
    setupDeviceToggle();
    setupDropdown();
    setupEventListeners();

    // 初期デバイス(iPhone)のロードとセットアップ
    initializeDevice('iphone');
});

/**
 * デバイスデータのロードと前処理
 */
function loadDeviceData(deviceType) {
    if (DATA_CACHE[deviceType]) return DATA_CACHE[deviceType];

    const config = DEVICE_CONFIG[deviceType];
    if (!config) return [];

    // グローバル変数からデータを取得
    // window[config.dataVar] でアクセス
    const rawData = window[config.dataVar];

    if (!rawData) {
        console.warn(`Data not found for ${deviceType}: ${config.dataVar}`);
        return [];
    }

    // 必要に応じてデータを拡張（computed properties）
    const processedData = rawData.map(item => {
        const newItem = { ...item };
        if (config.computedProps) {
            Object.keys(config.computedProps).forEach(prop => {
                try {
                    newItem[prop] = config.computedProps[prop](item);
                } catch (e) {
                    console.warn(`Error computing property ${prop} for ${item['名称']}`, e);
                }
            });
        }
        return newItem;
    });

    DATA_CACHE[deviceType] = processedData;
    console.log(`Loaded ${processedData.length} items for ${deviceType}`);
    return processedData;
}

/**
 * デバイス切り替え時の初期化処理
 */
function initializeDevice(deviceType) {
    currentDevice = deviceType;
    const config = DEVICE_CONFIG[deviceType];
    const data = loadDeviceData(deviceType);

    // 1. フィルターUIの生成
    renderDynamicFilters(deviceType, data);

    // 2. 検索プレースホルダーの更新
    updateSearchPlaceholder();

    // 3. 結果エリアクリア
    document.getElementById('resultArea').innerHTML = '';
}

/**
 * デバイス切り替えボタンの設定
 */
function setupDeviceToggle() {
    const tabsContainer = document.getElementById('deviceTabs');
    const buttons = document.querySelectorAll('.device-btn');

    // マウスドラッグでのスクロールサポート
    let isDown = false;
    let startX;
    let scrollLeft;

    tabsContainer.parentElement.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - tabsContainer.parentElement.offsetLeft;
        scrollLeft = tabsContainer.parentElement.scrollLeft;
    });
    tabsContainer.parentElement.addEventListener('mouseleave', () => { isDown = false; });
    tabsContainer.parentElement.addEventListener('mouseup', () => { isDown = false; });
    tabsContainer.parentElement.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabsContainer.parentElement.offsetLeft;
        const walk = (x - startX) * 2; // スクロール速度
        tabsContainer.parentElement.scrollLeft = scrollLeft - walk;
    });

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const device = btn.dataset.device;
            initializeDevice(device);
        });
    });
}

/**
 * 動的フィルターの生成
 */
function renderDynamicFilters(deviceType, data) {
    const container = document.getElementById('dynamicFiltersContainer');
    container.innerHTML = ''; // クリア

    const config = DEVICE_CONFIG[deviceType];
    if (!config.filters || config.filters.length === 0) return;

    config.filters.forEach(filterKey => {
        // ラッパー作成
        const wrapper = document.createElement('div');
        wrapper.className = 'dynamic-filter-wrapper';

        // セレクトボックス作成
        const select = document.createElement('select');
        select.className = 'dynamic-filter';
        select.dataset.filterKey = filterKey;

        // デフォルトオプション
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `全ての${filterKey}`;
        select.add(defaultOption);

        // 選択肢の生成
        const values = new Set();
        data.forEach(item => {
            if (item[filterKey]) {
                values.add(item[filterKey]);
            }
        });

        // ソートして追加
        // 発売年は降順、それ以外は昇順辞書順などが一般的だが、とりあえず文字列ソート
        const sortedValues = Array.from(values).sort((a, b) => {
            // 数字が含まれる場合は数値として比較を試みる (例: 年)
            const numA = parseInt(String(a).replace(/\D/g, '')) || 0;
            const numB = parseInt(String(b).replace(/\D/g, '')) || 0;
            if (numA > 0 && numB > 0 && filterKey.includes('年')) {
                return numB - numA; // 年なら降順
            }
            return String(a).localeCompare(String(b));
        });

        sortedValues.forEach(val => {
            const option = document.createElement('option');
            option.value = val;
            option.textContent = val;
            select.add(option);
        });

        wrapper.appendChild(select);
        container.appendChild(wrapper);
    });
}

/**
 * メイン検索実行関数
 */
function performSearch() {
    const input = document.getElementById('searchInput').value.trim();
    const searchType = document.getElementById('searchType').value; // 'model' or 'name'
    const config = DEVICE_CONFIG[currentDevice];
    const data = loadDeviceData(currentDevice);

    if (!data || data.length === 0) {
        showError('データのロードに失敗しました');
        return;
    }

    // フィルターの値を取得
    const activeFilters = {};
    const filterElements = document.querySelectorAll('.dynamic-filter');
    let hasActiveFilter = false;
    filterElements.forEach(el => {
        if (el.value) {
            activeFilters[el.dataset.filterKey] = el.value;
            hasActiveFilter = true;
        }
    });

    // 何も入力がない場合
    if (!input && !hasActiveFilter) {
        showError('検索条件を入力してください');
        return;
    }

    // 検索処理
    // 1. テキスト検索（入力がある場合）
    // 2. フィルター絞り込み（選択がある場合）
    // 両方ある場合は遅延評価(lazy)ではなくAND条件で絞り込む

    let results = data;

    // Step 1: Text Search
    if (input) {
        if (searchType === 'model') {
            const normalizedInput = normalizeModelNumber(input);
            results = results.filter(item => {
                const modelNumbers = item['モデル番号'];
                if (Array.isArray(modelNumbers)) {
                    return modelNumbers.some(m => m.toUpperCase().includes(normalizedInput));
                }
                if (typeof modelNumbers === 'string') {
                    // カンマ区切りなども考慮
                    const list = modelNumbers.split(/[,、]/).map(m => normalizeModelNumber(m));
                    return list.some(m => m.includes(normalizedInput));
                }
                return false;
            });
        } else {
            // Name search
            const normalizedInput = normalizeForNameSearch(input);
            results = results.filter(item => {
                const normalizedName = normalizeForNameSearch(item['名称']);

                // シリーズ名そのものか確認（例: "iPad Pro"）
                if (item['シリーズ'] && normalizeForNameSearch(item['シリーズ']) === normalizedInput) {
                    return true;
                }

                // 部分一致
                return normalizedName.includes(normalizedInput) || normalizedInput.includes(normalizedName);
            });
        }
    }

    // Step 2: Filters
    if (hasActiveFilter) {
        Object.keys(activeFilters).forEach(key => {
            const filterValue = activeFilters[key];
            results = results.filter(item => item[key] === filterValue);
        });
    }

    // Step 3: Display
    if (results.length > 0) {
        displayResult(results);
    } else {
        const cond = [];
        if (input) cond.push(`"${input}"`);
        if (hasActiveFilter) cond.push('選択した条件');
        showError(`条件に一致する${config.label}が見つかりませんでした (${cond.join(' + ')})`);
    }
}

/**
 * 検索結果表示
 */
function displayResult(results) {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = '';

    results.forEach(device => {
        // モデル番号表示列
        let modelStr = '';
        if (Array.isArray(device['モデル番号'])) {
            modelStr = device['モデル番号'].join(', ');
        } else {
            modelStr = device['モデル番号'] || '不明';
        }

        // 基本情報行の生成
        let infoRows = '';

        // 発売年
        if (device['発売年']) {
            infoRows += createInfoRow('発売年', device['発売年']);
        }

        // CPU
        if (device['CPU']) {
            infoRows += createInfoRow('CPU', device['CPU']);
        }

        // 容量
        if (device['容量']) {
            infoRows += createInfoRow('容量', device['容量']);
        }

        // カラー
        if (device['カラー']) {
            infoRows += createInfoRow('カラー', device['カラー']);
        }

        // 画面サイズ (Macなど)
        if (device['画面サイズ']) {
            infoRows += createInfoRow('画面サイズ', device['画面サイズ']);
        }

        // シリーズ (AirPods等で表示)
        if (device['シリーズ']) {
            infoRows += createInfoRow('シリーズ', device['シリーズ']);
        }

        // 特徴 (改行を含む場合があるため微調整)
        let featureHtml = '';
        if (device['特徴'] || device['特徴（見分け方）']) {
            const featureText = device['特徴'] || device['特徴（見分け方）'];
            featureHtml = `
                <div class="feature-section">
                    <p class="feature-label">特徴 / 詳細</p>
                    <p class="feature-text">${escapeHtml(featureText)}</p>
                </div>
            `;
        }

        const cardHtml = `
            <div class="result-card" style="margin-bottom: 24px;">
                <div class="result-card-header">
                    <h2 class="result-card-title">${escapeHtml(device['名称'])}</h2>
                    <p class="result-card-subtitle">${escapeHtml(modelStr)}</p>
                </div>
                <div class="result-card-body">
                    ${infoRows}
                    ${featureHtml}
                </div>
            </div>
        `;
        resultArea.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function createInfoRow(label, value) {
    return `
        <div class="info-row">
            <span class="info-label">${escapeHtml(label)}</span>
            <span class="info-value">${escapeHtml(String(value))}</span>
        </div>
    `;
}

/**
 * ヘルパー: モデル番号の正規化
 */
function normalizeModelNumber(input) {
    if (!input) return '';
    let normalized = input.trim();
    normalized = normalized.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    return normalized.toUpperCase();
}

/**
 * ヘルパー: 名称検索用の正規化
 */
function normalizeForNameSearch(input) {
    if (!input) return '';
    let normalized = input.trim().toLowerCase();
    normalized = normalized.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    // 空白削除して比較する場合もあるが、今回は"Series 9"などを区別したいので空白は残す（トリムのみ）
    // もしくは単語間の空白を1つに統一
    return normalized.replace(/\s+/g, ' ');
}

/**
 * ドロップダウン（検索タイプ）のセットアップ
 */
function setupDropdown() {
    const selector = document.getElementById('searchTypeSelector');
    const menu = document.getElementById('dropdownMenu');
    const items = document.querySelectorAll('.dropdown-item');
    const label = document.getElementById('selectorLabel');
    const hiddenInput = document.getElementById('searchType');
    const searchInput = document.getElementById('searchInput');

    // トグル
    selector.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.toggle('open');
    });

    // 外部クリックで閉じる
    document.addEventListener('click', () => {
        selector.classList.remove('open');
    });

    // アイテム選択
    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const value = item.dataset.value;
            const text = item.textContent;

            label.textContent = text;
            hiddenInput.value = value;

            updateSearchPlaceholder();
            searchInput.focus();
        });
    });
}

function updateSearchPlaceholder() {
    const searchType = document.getElementById('searchType').value;
    const config = DEVICE_CONFIG[currentDevice];
    const input = document.getElementById('searchInput');

    if (searchType === 'model') {
        input.placeholder = config.placeholderModel;
    } else {
        input.placeholder = config.placeholderName;
    }
}

function setupEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function showError(msg) {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `<div class="error-message">${escapeHtml(msg)}</div>`;
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function (match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[match];
    });
}

// Global Clock Functionality
document.addEventListener('DOMContentLoaded', function () {
    function updateClock() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const day = days[now.getDay()];
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const timeString = `${month}月${date}日(${day}) ${hours}:${minutes}`;

        const clockElement = document.getElementById('menuClock');
        if (clockElement) {
            clockElement.textContent = timeString;
        }
    }

    // Start Clock
    updateClock();
    setInterval(updateClock, 10000);
});

// Draggable Window Logic
document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.app-container');
    const header = document.querySelector('.app-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Handle center positioning on first drag
    // transforming translate(-50%, -50%) to pixel values
    let firstDrag = true;

    function dragStart(e) {
        // 【追加】スマホ(横幅480px以下)ならドラッグ機能を無効化する
        if (window.innerWidth <= 480) return;

        if (e.target.closest('.window-controls')) return; // ボタンをクリックした時はドラッグしない

        if (firstDrag) {
            const rect = container.getBoundingClientRect();
            // 最初のドラッグ時に位置を固定値(px)に書き換える
            container.style.left = rect.left + 'px';
            container.style.top = rect.top + 'px';
            container.style.transform = 'none'; // 中央寄せ解除
            firstDrag = false;
        }

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        const rect = container.getBoundingClientRect();
        xOffset = clientX - rect.left;
        yOffset = clientY - rect.top;

        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            // ドラッグ中はブラウザ標準のスクロールなどを防ぐ
            e.preventDefault();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            currentX = clientX - xOffset;
            currentY = clientY - yOffset;

            container.style.left = currentX + 'px';
            container.style.top = currentY + 'px';
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    header.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
});
