export default function generateHtml(stylesheet: string, bodyHtml: string) {
    return `<!doctype html>

<html lang="en">
    <head>
        <title>Resume</title>
        <meta charset="utf-8">
        <style>
            ${stylesheet}
        </style>
        <link href="https://fonts.googleapis.com/css?family=Merriweather|Open+Sans&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0">
        ${bodyHtml}
    </body>
</html>
`;
}