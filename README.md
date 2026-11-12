# Our Home Journal

A lightweight, mobile-friendly construction journal for recording the work, costs, dates, locations, suppliers, alternatives and decisions involved in building your home.

## Open it locally

Open `index.html` in a modern browser. No install or build step is required.

### Starter sign-in

- Username: `admin`
- Password: `homejournal`

To change the starter values, edit `LOGIN_USERNAME` and `LOGIN_PASSWORD` near the top of `app.js`.

> **Important privacy note:** GitHub Pages serves a static website. A username and password checked in browser JavaScript are visible to anyone who can inspect the published website; they only act as a convenience gate, not real security. Journal entries are stored in the current browser's local storage on the current device. They are not synced, encrypted, or protected from other people who can use that browser. Download regular JSON backups. Do not record secrets or publish private project data. Real access control and shared storage require a backend with authentication.

## Journal features

- Add, edit and delete dated work entries.
- Track the work type, status, actual cost, planned budget, time, location, vendor, shop, progress details, alternatives, comments and next steps.
- Add a link to a shared photo, receipt or other reference.
- Filter by month and work type, or search across journal entries.
- Review monthly recorded spend, entries and work in progress.
- Export the journal to CSV or import a JSON backup.

## Publish for free with GitHub Pages

1. Create a GitHub repository for the website. Do not add quotations, receipts, other private project documents or credentials to a public repository.
2. From this project folder, initialize Git and push the website files:

   ```powershell
   git init
   git add index.html styles.css app.js README.md .gitignore
   git commit -m "Create Our Home Journal website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. In the repository on GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. After GitHub Pages finishes deploying, open the Pages URL shown in the repository settings.

GitHub Pages is free for public repositories. A private source repository may also be eligible for Pages on GitHub Free, subject to GitHub's current plan and account policies; the published site remains public.

The `.gitignore` in this folder excludes the `Quotations` directory and common quotation document formats so project documents are not accidentally published with the site. Review `git status` before pushing.
