module.exports = {
    purge: { enabled: true, content: ["./public/*.html", "./public/*.css", "./public/*.js"] },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
    },
    variants: {
        extend: { backgroundColor: ["active"], scale: ["active"] },
    },
    plugins: [],
};