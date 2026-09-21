# Villas of Worthington HOA website

This repository is the entire public website for the Villas of
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
├── finances.html         Dues, self-managed outlook & reserve fund charts
├── minutes.html          Meeting minutes (placeholder until posted)
├── contact.html          Contact page
├── 404.html               Shown for any URL that doesn't exist
├── documents/
│   ├── documents.json     The list that documents.html reads
│   ├── New-Homeowner-Welcome-Packet.pdf
│   ├── Declaration.pdf
│   ├── Bylaws.pdf
│   ├── Design-Guidelines.pdf
│   ├── Rules-and-Regulations.pdf
│   ├── Community-Map.pdf
│   ├── Maintenance-Map.pdf
│   ├── Reserve-Study-2025.pdf
│   ├── Reserve-Study-2016.pdf
│   ├── Insurance-Summary.pdf
│   └── Certificate-of-Continued-Existence-2023.pdf
├── minutes/
│   └── minutes.json       The list that minutes.html reads
├── assets/
│   ├── css/style.css      All page styling
│   ├── img/                Logo images
│   ├── data/
│   │   └── search-index.json  Pre-built text index for the Documents
│   │                           page search box (see "Rebuilding the
│   │                           document search index" below)
│   └── js/                Small scripts (mobile menu, document list,
│                           document search, minutes list, ARC form,
│                           finance charts)
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

### Rebuilding the document search index

The Documents page has a search box that searches the *text* of the
Declaration, Bylaws, Rules & Regulations, Design Guidelines, the New
Homeowner Welcome Packet, and the Insurance Summary — powered by
`assets/data/search-index.json`, a pre-built file of text chunks pulled out
of those PDFs ahead of time (there's no server here to search them live).

This index is **not** something to hand-edit, and it doesn't update itself
when a document changes. If you replace one of the searchable documents
above with a revised version (a new Design Guidelines revision, an amended
Declaration, etc.), ask whoever/whatever helped build this site originally
to regenerate `assets/data/search-index.json` from the new PDF text — the
search box will otherwise keep returning results from the old version.
Adding a document that *isn't* in that list (a map, a reserve study, the
Certificate of Continued Existence) doesn't require touching the index at
all; it just won't be searchable, which is fine for documents nobody
searches within.

### Keeping the no-JavaScript fallback in sync

The Documents and Minutes pages both build their lists with JavaScript
(fetching `documents.json` / `minutes.json`), so a visitor with JavaScript
turned off, or whose browser blocks the request, would otherwise see a
permanently empty page. Both pages carry a `<noscript>` block — plain,
static HTML links to the same PDFs — that only renders in that situation
(browsers with JavaScript on never show it, so most visitors never see
it). It's **not** generated automatically: whenever you add, remove, or
rename a document in `documents.json` or `minutes.json`, make the same
change to the `<noscript>` block near the bottom of the matching `<ul
class="doc-list">` in `documents.html` or `minutes.html`. Missing this
just means the no-JS fallback is stale, not that the (JavaScript) page
visitors actually see is affected — but it's worth keeping current.

## Adding meeting minutes

Same pattern as documents, one folder over: drop the PDF into `minutes/`
and add one entry to `minutes/minutes.json` — e.g.

```json
{
  "title": "September 2026 Board Meeting",
  "file": "2026-09-Minutes.pdf",
  "note": "Approved October 2026"
}
```

(Update the `<noscript>` fallback in `minutes.html` too — see "Keeping the
no-JavaScript fallback in sync" above.)

`minutes/minutes.json` starts as an empty list (`[]`), which is why the
Minutes page currently shows a "work in progress" notice instead of a
list — that notice disappears on its own once the file has at least one
entry.

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

**Keep this repository public.** On a free GitHub account, GitHub Pages
cannot publish from a private repository at all — the repo just being
public is what makes the *site* public, and that's fine, since nothing in
here is sensitive (see "Confirm the public PDFs are meant to be public"
below for the one thing worth double-checking on that front). If the repo
is ever switched to private, GitHub silently disables Pages (it resets
**Settings → Pages → Source** back to "None"); the fix is to switch the
repo back to public and re-select **GitHub Actions** as the source there,
then re-run the "Deploy site to GitHub Pages" workflow from the **Actions**
tab. Keeping the *site* itself private while the repo stays public isn't
possible on GitHub Pages; that would need a different host entirely.

### Moving to a custom domain

The site currently lives at `dtputerbaugh.github.io/villas-of-worthington-hoa/`.
Moving it to a real domain (e.g. `villasofworthingtonhoa.com`) takes a few
manual steps, done once:

1. **Add a `CNAME` file** to the repository root containing just the
   domain (e.g. `villasofworthingtonhoa.com`), no `http://` and no path.
2. **Point DNS at GitHub Pages** — with whoever sells/hosts the domain,
   add the DNS records GitHub's own docs specify for a Pages custom domain
   (either an apex `A`/`AAAA` record, or a `CNAME` record if using a
   subdomain like `www`). See GitHub's "Managing a custom domain for your
   GitHub Pages site" docs for the exact records — they change occasionally,
   so check there rather than relying on old instructions.
3. Once DNS has propagated, go to **Settings → Pages** and enable
   **Enforce HTTPS** (GitHub needs the DNS in place first before it can
   issue a certificate; this checkbox may be greyed out until then).
4. **Update `404.html`.** It has a `<base href="https://dtputerbaugh.github.io/villas-of-worthington-hoa/">`
   tag near the top (see the comment above it) so the page's links and
   styling still work no matter how deep a mistyped URL was. Change that
   one `href` to the new domain (e.g. `https://villasofworthingtonhoa.com/`)
   — nothing else on the page needs to change.
5. **Confirm `board@villasofworthingtonhoa.com` actually receives mail**
   before pointing anyone at the new domain. That's a separate DNS
   question (MX records for mail) from the website's own DNS records above
   — whoever set up that inbox can confirm it's unaffected, but it's worth
   checking explicitly rather than assuming, since it's easy to change the
   website's DNS without touching mail and vice versa.
6. **Re-check every `mailto:` link and the PayHOA link** after the move.
   They're absolute URLs (not relative to this site), so they should keep
   working unchanged — but it's a five-minute check worth doing once,
   rather than assuming.

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
  someone without one configured on their device. For that case, the form
  always reveals a "copy the message and send it yourself" box after
  submitting, with a **Copy message** button — this isn't conditional on
  detecting whether the email app actually opened (a static site can't
  reliably detect that), so it's just always there as a fallback. The
  direct email address on the Contact page is the other fallback.
- If the typed answers make the message too long for a `mailto:` link to
  carry reliably (a generous but real limit — `MAILTO_SAFE_LENGTH` near
  the top of `assets/js/arc-form.js`), the form skips attempting the
  `mailto:` link entirely and goes straight to the copy/paste box instead,
  so nothing silently truncates in the visitor's email app.
- Browsers can cache `.js` files, so a visitor who has the ARC page
  already open (or revisits it soon after) may keep running the *old*
  script even after a new version is live. Whenever `arc-form.js`
  changes, bump the `?v=` number on its `<script>` tag in
  `arc-request.html` (e.g. `arc-form.js?v=3`) — that forces every
  browser to fetch the new version instead of a cached one.

## Updating the Finances page

Unlike Documents and Minutes, `finances.html` is **not** driven by a JSON
file — the dollar figures and the chart data both live directly in the
page and in `assets/js/finances.js`, because updating them (a new year's
actuals, a new Reserve Study) means someone is deliberately revising the
numbers, not just dropping in a new file.

- The charts and the interactive reserve timeline are drawn by
  `assets/js/finances.js` — each dataset is a small array (or, for
  `reserveBalanceByYear`, an object) near the top of the file
  (`duesBreakdown`, `spendingTrend`, `reserveAllocation`,
  `reserveExpenditures`, `reserveBalanceByYear`, `pctFunded`), with a
  comment above each explaining where its numbers came from. Change the
  numbers there; the diagrams, legends, tables, and the timeline's
  year-by-year detail panel all regenerate from the same arrays.
  `spendingTrend` and `reserveExpenditures` use a small array of
  `{ cat, value }` items per year rather than a single number, so each
  year's bar (or, for `reserveExpenditures`, each year's entry in the
  timeline) can be split and color-coded by category —
  `TREND_CATEGORIES` and `RESERVE_CATEGORIES` (just above each dataset)
  list the categories in the fixed order that sets their color.
  `reserveExpenditures` also drives the "What's coming? Explore the
  reserve timeline" section (click a year, see that year's planned work);
  `reserveBalanceByYear` supplies that timeline's year-end balance figure
  and is read from the 2025 Reserve Study's own cash-flow projection, not
  the Association's actual balance — see the comment above it.
- The stat tiles (the boxed numbers like "$400" or "Fully Funded") are
  plain text in `finances.html` — edit them directly.
- When a new Reserve Study or a finalized self-managed budget is adopted,
  update both the figures here and the sourcing note in the page's
  disclosure box at the top, so it stays clear these are current
  best-estimate planning figures rather than final audited numbers.

## Editing existing pages (officers, contact info, etc.)

For text that isn't in a JSON file — like the officer names on
`about.html` or the resident portal link on `index.html` — open the
relevant `.html` file in GitHub, click the pencil/edit icon, and change
the text directly. Look for `<!-- TODO ... -->` comments in the files —
each one marks a spot still waiting on real information.

The PayHOA link (`https://app.payhoa.com/sign-up/...`) appears in several
places: the home page's "Resident Portal (PayHOA)" button, the "Where
this goes" routing list on the Contact page, and the footer of every
page. It's currently PayHOA's *sign-up* URL — worth confirming with
PayHOA (or checking the page it lands on) whether that's the right link
for existing residents too, or whether a separate login URL should be
used there instead. If it ever changes, it's the same `href` repeated in
each of those spots (search the codebase for `payhoa.com` to find them
all).

The Contact page's mailing address is the Board President's home address,
which the Board formally adopted as the Association's official mailing
address in the July 21, 2026 meeting minutes. If the Board later adopts a
different address (a new President's address, a PO box, etc.), update the
address block on `contact.html` and note the source (e.g., the minutes
that changed it).

### "Page last updated" footer dates

Every page's footer has a small "Page last updated: `<Month Day, Year>`"
line. It's a plain hardcoded date, not generated automatically — whenever
you make a real content change to a page (not just this README, and not
a site-wide CSS/JS tweak that touches every page for an unrelated
reason), update that page's own date to the day you made the change. A
quick way to find the current value: search the file for
`footer-updated`.

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
