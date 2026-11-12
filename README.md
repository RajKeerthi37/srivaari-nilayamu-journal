# Our Home Journal

A lightweight, mobile-friendly construction journal for recording the work, costs, dates, locations, suppliers, alternatives and decisions involved in building your home.

## Open it locally

Open `index.html` in a modern browser. No install or build step is required.

### Starter sign-in

- Username: `admin`
- Password: `homejournal`

To change the starter values, edit `LOGIN_USERNAME` and `LOGIN_PASSWORD` near the top of `app.js`.

> **Important privacy note:** The GitHub Pages website and its source repository are public. The username and password checked in browser JavaScript are visible to anyone who visits or inspects the site; they are only a convenience gate, not real security. Journal entries are stored in this browser on this device. They are not synced, encrypted, or protected from other people who can use this browser. Download regular JSON backups. Do not record secrets or publish private project data. Real access control and shared storage require a backend with authentication.

## Journal features

- Add, edit and delete dated work entries.
- Track the work type, status, actual cost, planned budget, time, location, vendor, shop, progress details, alternatives, comments and next steps.
- Add a link to a shared photo, receipt or other reference.
- Filter by month and work type, or search across journal entries.
- Review monthly recorded spend, entries and work in progress.
- Export the journal to CSV or import a JSON backup.

## Publish for free with GitHub Pages

The site is already published at **<https://rajkeerthi37.github.io/srivaari-nilayamu-journal/>** from the `main` branch at the repository root.

The source repository is public because GitHub Pages on this GitHub Free account requires a public repository. Anyone can view or copy the website source. Only the five website files (`index.html`, `styles.css`, `app.js`, `README.md` and `.gitignore`) were uploaded.

To publish changes using GitHub's website:

1. Open <https://github.com/RajKeerthi37/srivaari-nilayamu-journal>.
2. Choose **Add file → Upload files**.
3. Upload only the website files you want to update, then commit the change to `main`.
4. GitHub Pages rebuilds automatically. The site usually updates within a few minutes.

For command-line changes, clone the repository or update this local copy, authenticate Git with your GitHub account, then commit and push changes to `main`. The local project folder also contains quotation and spreadsheet documents. The `.gitignore` excludes the `Quotations` folder and common quotation document formats; review `git status` before committing or pushing, and do not upload private project documents, receipts or secrets.
