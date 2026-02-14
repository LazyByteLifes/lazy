(function () {
    const fallbackArticles = [
        {
            title: "Lazy Pick",
            desc: "Take a short break and let the app pick something.",
            icon: "ph-moon-stars",
            color: "#5B95F5",
            bg: "rgba(91, 149, 245, 0.15)"
        }
    ];

    async function getRandomArticles() {
        const loader = window.DataLoader;
        if (loader && typeof loader.fetchArticleIndex === "function") {
            try {
                const index = await loader.fetchArticleIndex();
                if (Array.isArray(index) && index.length > 0) {
                    return index;
                }
            } catch (error) {
                // Fall through to fallback data.
            }
        }

        const dataEl = document.getElementById("randomArticlesData");
        if (dataEl && dataEl.textContent) {
            try {
                const parsed = JSON.parse(dataEl.textContent);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (error) {
                return fallbackArticles;
            }
        }
        return fallbackArticles;
    }

    async function showRandomCard() {
        const modal = document.getElementById("luckyModal");
        if (!modal) {
            return;
        }

        const articles = await getRandomArticles();
        const item = articles[Math.floor(Math.random() * articles.length)];
        const titleEl = document.getElementById("modalTitle");
        const descEl = document.getElementById("modalDesc");
        const iconEl = document.getElementById("modalIcon");
        const imgBox = document.getElementById("modalImgBox");
        const goBtn = modal.querySelector(".lucky-btn");

        if (titleEl) {
            titleEl.innerText = item.title;
        }
        if (descEl) {
            descEl.innerText = item.desc;
        }
        if (iconEl) {
            iconEl.className = "ph-duotone " + item.icon;
        }
        if (imgBox) {
            imgBox.style.backgroundColor = item.bg;
            imgBox.style.color = item.color;
        }
        if (goBtn && item.id) {
            goBtn.onclick = function () {
                window.location.href = `article.html?id=${item.id}`;
            };
        }

        modal.classList.add("active");
    }

    function initBottomNav() {
        const fireBtn = document.getElementById("fireBtn");
        const diceBtn = document.getElementById("diceBtn");
        const searchBtn = document.getElementById("searchBtn");
        const searchInput = document.getElementById("realSearchInput");

        if (fireBtn) {
            fireBtn.addEventListener("click", function () {
                this.classList.add("fire-active");
                const target = this.getAttribute("data-target") || "posts.html";
                setTimeout(() => {
                    window.location.href = target;
                }, 300);
            });
        }

        if (diceBtn) {
            diceBtn.addEventListener("click", function () {
                this.classList.add("dice-rolling");
                setTimeout(() => {
                    this.classList.remove("dice-rolling");
                    void showRandomCard();
                }, 600);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener("click", function () {
                const modal = document.getElementById("searchModal");
                if (!modal) {
                    return;
                }
                modal.classList.add("active");
                setTimeout(() => {
                    const input = document.getElementById("realSearchInput");
                    if (input) {
                        input.focus();
                    }
                }, 100);
            });
        }

        if (searchInput) {
            searchInput.addEventListener("keypress", function (e) {
                if (e.key === "Enter") {
                    const val = this.value;
                    if (val) {
                        window.location.href = "search_results.html?q=" + encodeURIComponent(val);
                    }
                }
            });
        }

        window.addEventListener("click", function (event) {
            const target = event.target;
            if (target && target.classList && target.classList.contains("modal-overlay")) {
                target.classList.remove("active");
            }
        });
    }

    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove("active");
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initBottomNav);
    } else {
        initBottomNav();
    }
})();
