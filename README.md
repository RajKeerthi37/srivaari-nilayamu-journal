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

The source repository and website are public. The **Quotation** section compares the published workbook's estimated totals and scope from three companies; the original workbook can also be downloaded from the site. Anyone can view the workbook, the extracted quotation details and the website source. Do not upload other private project documents, receipts or secrets.

To publish changes using GitHub's website:

1. Open <https://github.com/RajKeerthi37/srivaari-nilayamu-journal>.
2. Choose **Add file → Upload files**.
3. Upload the website files you want to update. To update quotation details, upload both `Quotation all clubed.xlsx` and the regenerated `quotation-data.js`, then commit the changes to `main`.
4. GitHub Pages rebuilds automatically. The site usually updates within a few minutes.

To regenerate the static comparison data after editing the workbook, install `openpyxl` for Python and run `python generate_quotation_data.py`. The script reads only `Quotation all clubed.xlsx` and writes `quotation-data.js`.

For command-line changes, clone the repository or update this local copy, authenticate Git with your GitHub account, then commit and push changes to `main`. The `.gitignore` excludes the `Quotations` folder and other spreadsheets/documents; only the named comparison workbook is allowed through. Review `git status` before committing.
