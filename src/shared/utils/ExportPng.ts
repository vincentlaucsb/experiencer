import html2canvas from 'html2canvas';

/**
 * Exports the resume as a PNG image and opens it in a popup window
 * @param resumeElement - The DOM element containing the resume
 */
export async function exportResumeToPng(resumeElement: HTMLElement | null) {
    if (!resumeElement) {
        console.error('Resume element not found');
        return;
    }

    try {
        // Generate canvas from the resume element with higher resolution
        const canvas = await html2canvas(resumeElement, {
            scale: 6, // Increase scale for higher resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Failed to create blob from canvas');
                return;
            }

            const url = URL.createObjectURL(blob);
            
            // Open in popup window
            const popupWindow = window.open('', 'Resume PNG', 'width=900,height=1100');
            if (popupWindow) {
                popupWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Resume Screenshot</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 20px;
                                background-color: #f0f0f0;
                                display: flex;
                                justify-content: center;
                                align-items: flex-start;
                                font-family: Arial, sans-serif;
                            }
                            .container {
                                background: white;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                max-width: 800px;
                            }
                            img {
                                width: 100%;
                                height: auto;
                                display: block;
                            }
                            .controls {
                                margin-top: 20px;
                                display: flex;
                                gap: 10px;
                                justify-content: center;
                            }
                            button {
                                padding: 10px 20px;
                                font-size: 14px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                background: #f5f5f5;
                                cursor: pointer;
                                transition: background 0.2s;
                            }
                            button:hover {
                                background: #e0e0e0;
                            }
                            .copy-feedback {
                                margin-top: 10px;
                                text-align: center;
                                color: #4caf50;
                                font-size: 14px;
                                display: none;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <img id="resumeImage" src="${url}" alt="Resume Screenshot" />
                            <div class="controls">
                                <button onclick="copyToClipboard()">Copy to Clipboard</button>
                                <button onclick="downloadImage()">Download</button>
                                <button onclick="window.close()">Close</button>
                            </div>
                            <div class="copy-feedback" id="copyFeedback">✓ Copied to clipboard!</div>
                        </div>
                        <script>
                            function copyToClipboard() {
                                const img = document.getElementById('resumeImage');
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                const image = new Image();
                                
                                image.onload = function() {
                                    canvas.width = image.width;
                                    canvas.height = image.height;
                                    ctx.drawImage(image, 0, 0);
                                    
                                    canvas.toBlob(blob => {
                                        const item = new ClipboardItem({ 'image/png': blob });
                                        navigator.clipboard.write([item]).then(() => {
                                            const feedback = document.getElementById('copyFeedback');
                                            feedback.style.display = 'block';
                                            setTimeout(() => {
                                                feedback.style.display = 'none';
                                            }, 2000);
                                        }).catch(err => {
                                            alert('Failed to copy image to clipboard');
                                            console.error(err);
                                        });
                                    });
                                };
                                
                                image.src = img.src;
                            }
                            
                            function downloadImage() {
                                const link = document.createElement('a');
                                link.href = '${url}';
                                link.download = 'resume-' + new Date().getTime() + '.png';
                                link.click();
                            }
                        </script>
                    </body>
                    </html>
                `);
                popupWindow.document.close();
            }
        });
    } catch (error) {
        console.error('Error exporting resume to PNG:', error);
        alert('Failed to export resume. Please try again.');
    }
}
