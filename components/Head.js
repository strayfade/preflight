const UseIcon = true;
const Head = async (Request, Title, Description, BuildData) => {
    return `
    <head>
        <meta charset="utf-8">
        <meta name="referrer" content="no-referrer">

        <meta property="og:site_name" content="strayfade.com">
        <meta property="og:url" content="strayfade.com">
        <meta name="twitter:url" content="strayfade.com">

        <title>${Title} | strayfade</title>
        <meta property="og:title" content="${Title} | Strayfade">
        <meta property="twitter:title" content="${Title} | Strayfade">

        <meta name="description" content="${Description}">
        <meta property="og:description" content="${Description}">
        <meta property="twitter:description" content="${Description}">

        <meta name="author" content="Strayfade">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#f0f0f0">
        ${UseIcon ? `
            <link rel="icon" href="/assets/Icon.svg" color="#ffffff">
            <link rel="mask-icon" href="/assets/Icon.svg" color="#ffffff">
        ` : ``}
        
        <link rel="dns-prefetch" href="https://strayfade.com">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        
        <style>
        ${BuildData.stylesheet}
        </style>
    </head>
    `
}
module.exports = { Head }