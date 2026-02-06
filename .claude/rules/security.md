# Security

## Client-Side Only
- All user data stays client-side
- No backend or API calls
- Uses localStorage for persistence

## XSS Protection
- React's built-in escaping for most content
- `dangerouslySetInnerHTML` used intentionally for Quill/rich text
- Validate user input where appropriate

## Data Privacy
- No telemetry or analytics
- No external data transmission
- User data never leaves the browser
