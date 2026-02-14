const CACHE = {
    config: null,
    index: null,
    home: null,
    articles: new Map()
};

async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.json();
}

export async function fetchSiteConfig() {
    if (CACHE.config) {
        return CACHE.config;
    }
    const data = await fetchJson("data/config.json");
    CACHE.config = data;
    return data;
}

export async function fetchArticleIndex() {
    if (CACHE.index) {
        return CACHE.index;
    }
    const data = await fetchJson("data/article_index.json");
    CACHE.index = data;
    return data;
}

export async function fetchHomeData() {
    if (CACHE.home && CACHE.index) {
        return CACHE.home;
    }

    const [homeData, index] = await Promise.all([
        fetchJson("data/home.json"),
        fetchArticleIndex()
    ]);

    const indexMap = new Map(index.map((item) => [item.id, item]));
    const featured = (homeData.featured_ids || [])
        .map((id) => indexMap.get(id))
        .filter(Boolean);
    const topHot = (homeData.top_hot_ids || [])
        .map((id) => indexMap.get(id))
        .filter(Boolean);

    CACHE.home = {
        ...homeData,
        featured,
        topHot
    };

    return CACHE.home;
}

export async function fetchArticleDetail(id) {
    if (CACHE.articles.has(id)) {
        return CACHE.articles.get(id);
    }

    const [detail, index] = await Promise.all([
        fetchJson(`data/posts/${id}.json`),
        fetchArticleIndex()
    ]);

    const meta = index.find((item) => item.id === id) || {};
    const merged = { ...meta, ...detail };

    CACHE.articles.set(id, merged);
    return merged;
}

export async function searchArticles(keyword) {
    const query = String(keyword || "").trim().toLowerCase();
    if (!query) {
        return [];
    }

    const index = await fetchArticleIndex();
    return index.filter((item) => {
        const title = String(item.title || "").toLowerCase();
        const desc = String(item.desc || "").toLowerCase();
        const category = String(item.category || "").toLowerCase();
        const tags = (item.tags || []).join(" ").toLowerCase();
        return (
            title.includes(query) ||
            desc.includes(query) ||
            category.includes(query) ||
            tags.includes(query)
        );
    });
}

window.DataLoader = {
    fetchSiteConfig,
    fetchArticleIndex,
    fetchHomeData,
    fetchArticleDetail,
    searchArticles
};
