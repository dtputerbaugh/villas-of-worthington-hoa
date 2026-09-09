# Villas at Worthington HOA website

This repository is the entire public website for the Villas at
Worthington Homeowners Association (North Royalton, Ohio). It's plain
HTML, CSS, and a little JavaScript — no build tools, no frameworks, and no
paid hosting required. This guide assumes no coding experience.

## What's in here

```
./
├── index.html          Home page
├── about.html           About page (board, self-management)
├── documents.html        Documents page (list of PDFs)
├── arc-request.html      Architectural change request form
├── contact.html          Contact page
├── documents/
│   ├── documents.json     The list that documents.html reads
│   ├── Declaration.pdf
│   ├── Bylaws.pdf
│   ├── Design-Guidelines.pdf
│   └── Rules-and-Regulations.pdf
├── assets/
│   ├── css/style.css      All page styling
│   ├── img/                Logo images
│   └── js/                Small scripts (mobile menu, document list, ARC form)
└── README.md            This file
```

## Adding a new document (e.g., a new Reserve Study)

You do **not** need to touch any HTML for this. Two steps:

1. **Add the PDF file.** In GitHub, open the `documents/` folder in this
   project, click **Add file → Upload files**, and upload your PDF. Give it
   a clear filename with no spaces, e.g. `Reserve-Study-2027.pdf` (use
   hyphens instead of spaces).
2. **Add one line to the list.** Open `documents/documents.json` in GitHub
   (click the file, then the pencil/edit icon). It's a simple list — each
   document is one `{ ... }` block. Copy an existing block, paste it as a
   new entry, and edit the fields:

   ```json
   {
     "title": "Reserve Study (2027)",
     "file": "Reserve-Study-2027.pdf",
     "note": "Most recent Reserve Study, adopted by the Board."
   }
   ```

   - `title` — what shows up as the document's name on the page.
   - `file` — the exact filename you uploaded in step 1.
   - `note` — a short line of context (date, instrument number, etc.). This
     can be left as `""` if you don't need one.

   Make sure every entry (except the last one) ends with a comma, and that
   the whole file is still valid JSON (matching `{ }` and `[ ]`, quotes
   around every piece of text). If you're not sure, ask someone to check
   your edit before saving, or open a pull request instead of committing
   directly (see below) so it can be reviewed first.

3. Commit the change (GitHub will prompt you for a short commit message —
   something like "Add 2027 Reserve Study" is fine). Once it's committed to
   the `main` branch, the site updates automatically within a couple of
   minutes (see **Deploying** below).

### Replacing an existing document

Same idea: upload the new PDF (it can reuse the old filename to overwrite
it, or use a new filename), and if you used a new filename, update the
`"file"` value for that entry in `documents.json` to match.

### Removing a document from the list

Delete its `{ ... }` block from `documents/documents.json`. You can leave
the PDF file in the `documents/` folder if you might want it again later —
only documents listed in `documents.json` show up on the page.

## Deploying changes

This site deploys automatically via **GitHub Actions**: any change pushed
(or committed through the GitHub website) to the `main` branch triggers a
workflow that publishes the site to GitHub Pages. You don't need to run
any commands — committing the change *is* the deploy.

- You can watch the deploy under the repository's **Actions** tab — look
  for the "Deploy site to GitHub Pages" workflow run. It usually finishes
  in under a minute.
- The live URL is shown in the repository's **Settings → Pages**, and also
  next to the workflow run once it finishes.

### One-time setup (already done, but here for reference)

For the automatic deploy to work at all, GitHub Pages must be configured
once per repository:

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

After that one-time step, every push to `main` deploys automatically using
`.github/workflows/deploy.yml`.

### Alternative: Cloudflare Pages

This site also works unchanged on Cloudflare Pages, if the Association
ever prefers that instead of GitHub Pages: connect the repository, leave
the **build output directory** as the repository root (`/`), and leave the
build command empty (there's nothing to build).

## How the ARC Request form works

`arc-request.html` is a fillable version of the Architectural Change
Request form. This site has no backend and nowhere to send form data to,
so clicking "Prepare Email to the Board" doesn't transmit anything itself —
it builds a plain-text summary of the answers and opens the visitor's own
email app with that summary filled in, addressed to
`board@villasofworthingtonhoa.com`. The visitor still has to review it,
attach any files, and click Send themselves.

- The board email address is set once, near the top of
  `assets/js/arc-form.js` (`BOARD_EMAIL`). If that address ever changes,
  update it there **and** on `contact.html`.
- The checkbox lists (type of request, attachments) and the mailto message
  format live in the same file if the form's fields ever need to change.
- Because this relies on the visitor's own email app, it won't work for
  someone without one configured on their device — the direct email
  address on the Contact page is the fallback for that case.

## Editing existing pages (officers, contact info, etc.)

For text that isn't in `documents.json` — like the officer names on
`about.html`, the resident portal link on `index.html`, or the mailing
address on `contact.html` — open the relevant `.html` file in GitHub,
click the pencil/edit icon, and change the text directly. Look for
`<!-- TODO ... -->` comments in the files — those mark the couple of spots
still waiting on real information:

- **Home page:** the "Resident Portal (PayHOA)" button needs its real link
  once it's available.
- **Contact page:** the mailing address is a placeholder until the Board
  supplies one.

## Previewing changes before you commit (optional, for anyone comfortable
with a terminal)

Because the Documents page loads `documents.json` with JavaScript, opening
`index.html` directly from your computer's file browser won't show the
document list correctly (browsers block that for local files). To preview
the whole site locally, run a tiny local server from this folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in a browser. This step is optional —
it's only useful if you want to check your changes before committing them;
the live site on GitHub Pages doesn't have this limitation.
