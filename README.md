# YC&AC Pulse Stats

A static season statistics dashboard that reads public Google Sheet data.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `ycac-pulse-stats`.
2. Upload `index.html`, `styles.css`, and `app.js` from this folder. The `generate-stats-workbook.cjs` file is only for rebuilding the original workbook and is not needed by the website.
3. In the repository, open **Settings** > **Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder, then save.
6. GitHub will provide the public site URL within a few minutes.

## Data source

The dashboard reads the `Players`, `Matches`, `Appearances`, and `Goals` tabs from the configured Google Sheet. The Sheet must remain **Anyone with the link: Viewer**. Updates to Sheet rows are reflected on the published site when visitors refresh the page.

Do not rename the tab names or header fields without updating `app.js`.
