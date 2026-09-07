/*
 * Stack / incline - Azure AD B2C custom UI
 * Theme bootstrap. Loaded synchronously in <head> so [data-theme] is set
 * before first paint (no flash of the wrong palette).
 *
 * Also derives the asset base URL from this script's own src, so nothing
 * downstream has to hard-code the version folder.
 */
(function () {
    "use strict";

    var VALID_THEMES = ["light", "dark"];

    var self = document.currentScript;
    var baseUrl = self && self.src ? self.src.replace(/[^/]*$/, "") : "";

    var savedTheme = null;
    try {
        savedTheme = localStorage.getItem("b2c_theme");
    } catch (error) {
        /* storage blocked (private mode, third-party cookie rules) */
    }

    var queryTheme = new URLSearchParams(window.location.search).get("theme");
    var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    // First candidate that is actually a theme we ship. An unknown ?theme=
    // value is ignored rather than written through to [data-theme].
    var theme = [queryTheme, savedTheme, systemTheme].filter(function (candidate) {
        return VALID_THEMES.indexOf(candidate) !== -1;
    })[0] || "light";

    try {
        // Only persist an explicit choice. Persisting the system theme would
        // pin the user to it and stop the page following later OS changes.
        if (queryTheme && VALID_THEMES.indexOf(queryTheme) !== -1) {
            localStorage.setItem("b2c_theme", queryTheme);
        }
    } catch (error) {
        /* storage blocked - the theme still applies for this page load */
    }

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");

    window.StackB2CAssets = { baseUrl: baseUrl, theme: theme };
})();
