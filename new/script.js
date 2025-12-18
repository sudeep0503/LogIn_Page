/* -----------------------------
   Query Helpers
----------------------------- */
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const level = parseInt(params.get("level") || "0", 10);
    const path = params.get("path")
        ? params.get("path").split(",")
        : [];
    return { level, path };
}

function buildURL(level, path) {
    const params = new URLSearchParams();
    params.set("level", level);
    if (path.length) {
        params.set("path", path.join(","));
    }
    return `${window.location.pathname}?${params.toString()}`;
}

/* -----------------------------
   Stepper
----------------------------- */
function renderStepper(container, path) {
    container.innerHTML = "";

    const fullPath = ["Home", ...path];

    fullPath.forEach((label, index) => {
        const step = document.createElement("div");
        step.className = "step";
        step.textContent = label;

        if (index < fullPath.length - 1) {
            step.classList.add("completed");
            step.style.cursor = "pointer";
            step.addEventListener("click", () => {
                const newPath = path.slice(0, index);
                window.location.href = buildURL(index, newPath);
            });
        } else {
            step.classList.add("active");
        }

        container.appendChild(step);
    });
}

/* -----------------------------
   Cards
----------------------------- */
function renderCards(container, items, onClick) {
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.textContent = item;
        card.addEventListener("click", () => onClick(item));
        container.appendChild(card);
    });
}

/* -----------------------------
   Tree Data (5 Levels)
----------------------------- */
const TREE = {
    Home: ["Country", "Technology", "Finance"],
    Country: ["India", "USA", "Germany"],
    India: ["Uttar Pradesh", "Maharashtra", "Karnataka"],
    "Uttar Pradesh": ["Noida", "Lucknow", "Kanpur"],
    Noida: ["Sector 62", "Sector 18", "Greater Noida"]
};

/* -----------------------------
   Main
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const { level, path } = getQueryParams();

    const stepper = document.getElementById("stepper");
    const cardsContainer = document.getElementById("cards-container");
    const pageTitle = document.getElementById("page-title");

    const currentNode = path.length === 0 ? "Home" : path[path.length - 1];

    pageTitle.textContent = currentNode;
    renderStepper(stepper, path);

    const children = TREE[currentNode] || [];

    renderCards(cardsContainer, children, (selected) => {
        const newPath = [...path, selected];
        window.location.href = buildURL(level + 1, newPath);
    });
});
