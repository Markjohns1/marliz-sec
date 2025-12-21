const config = {
    // Brand & Analytics
    DOMAIN: "marlizintel.com",
    SITE_NAME: "Marliz Intel",
    GA_MEASUREMENT_ID: "G-2ZQBCTG7B8",

    // API Endpoints
    API_BASE_URL: window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : "https://marlizintel.com/api",

    // SEO
    CANONICAL_BASE: "https://marlizintel.com",
};

export default config;
