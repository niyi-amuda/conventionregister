2026 NATIONAL YOUTH CONVENTION QR REGISTRATION
REAL SHARED DATABASE — VERSION 3

Connected to your existing Supabase project: yorlnzlfnyfqbxrctnyf

PUBLIC PAGE:  index.html
ADMIN PAGE:   admin.html

WHAT'S IN THIS VERSION
1. Admin dashboard and registration header read
   "EXCELLENT YOUTH FELLOWSHIP" instead of "THE LIVING TRUTH CHURCH".
   (The footer still shows "The Living Truth Church Headquarters, Warri"
   because that is the venue, not the organiser.)
2. Fixed the registration error "new row violates row-level security
   policy for table convention_registrations" — see STEP 1 below,
   you must run one SQL script for this to take effect.
3. Registration form now also asks:
   - Email Address (needed to send the confirmation email)
   - Are you an EYF member? (Yes/No)
   - Have you attended our Convention before? (Yes/No)
4. After a successful registration, a welcome/confirmation email is
   sent automatically through Brevo, via a Vercel serverless function
   that ships in this folder (see STEP 3 below).
5. Check-in is now per convention day. The admin selects Day 1–4 at
   the top of the scanner, and each scan for that day is recorded
   with its own timestamp — so the same person can be checked in
   once on each of the 4 days, and the dashboard/branch summary show
   attendance for whichever day is selected.
6. Fixed a bug in the scan screen (a stray variable assignment) that
   could break the live counters.
7. New "Manage Registrations" panel on the admin dashboard — search
   by name or registration number and delete a duplicate or unwanted
   registration. Deleting also removes that person's check-in history.
8. New colour theme: background gradient #003B63 → #004F82, with
   #00B8E5 and #FFCC34 used for buttons and accents.
9. Added your EYF LTC logo to the top of both pages (assets/logo.png).

======================================================================
STEP 1 — RUN THE DATABASE UPDATE (required)
======================================================================
1. Open your Supabase project → SQL Editor → New query.
2. Open schema_update.sql from this folder, paste its full contents,
   and click RUN.

This script:
- Adds the missing INSERT policy that was causing the row-level
  security error on the registration page.
- Adds the email, eyf_member and attended_before columns.
- Creates the convention_checkins table (one row per person per
  convention day) with admin-only RLS policies, and adds it to the
  realtime publication so the admin dashboard live-refreshes.
- Adds a DELETE policy so a logged-in admin can remove a registration
  from the dashboard (this cascades to that person's check-ins too).

The whole script is safe to re-run even if you already ran an earlier
version — it only creates or replaces policies/columns, it never
touches your existing registration data.

======================================================================
STEP 2 — DEPLOY THIS FOLDER TO VERCEL
======================================================================
Upload this whole folder to Vercel as a project (not just the public
files — the api/ folder needs to deploy too, that's what sends email).
Vercel automatically turns api/send-confirmation-email.js into a
serverless function at:
    your-domain.vercel.app/api/send-confirmation-email

Public registration page: your-domain.vercel.app/
Admin scanner:            your-domain.vercel.app/admin.html

======================================================================
STEP 3 — SET UP BREVO CONFIRMATION EMAILS (required for emails to send)
======================================================================
No CLI needed — everything is done from the Vercel dashboard.

1. In Brevo: go to Settings → SMTP & API and copy your API key.
   Also make sure the "from" email address you plan to use is a
   verified sender (or on a verified domain) in Brevo, or it will
   reject the send.
2. In Vercel: open your project → Settings → Environment Variables,
   and add:
     BREVO_API_KEY        = your Brevo API key
     BREVO_SENDER_EMAIL    = info@yourdomain.org  (verified in Brevo)
     BREVO_SENDER_NAME     = Excellent Youth Fellowship
     WHATSAPP_LINK         = https://chat.whatsapp.com/FbnVN9KiLxrBkd75ZzaBgD
3. Redeploy the project (any push, or "Redeploy" in Vercel) so the new
   environment variables take effect.

Notes:
- WHATSAPP_LINK is kept as a variable (not hard-coded in the email)
  so you can update the group link at any time from the Vercel
  dashboard without touching code or redeploying a file.
- If you skip this step, registration still works fine — the page
  tries to send the email in the background and quietly ignores a
  failure, so nobody's registration is blocked by an email problem.

======================================================================
HOW DAILY CHECK-IN WORKS
======================================================================
- The admin scanner screen shows 4 day buttons (Day 1–4, Oct 8–11).
  It automatically selects today's date if the device's date falls
  within the convention, otherwise it defaults to Day 1 — the admin
  can tap any day to switch.
- Scanning a person's QR code on a given day records one row in
  convention_checkins for (that person, that day, that time). If they
  are scanned again the same day, the app shows "ALREADY CHECKED IN"
  instead of creating a duplicate.
- The Live Attendance numbers and Branch Summary always reflect
  whichever day is currently selected.
- "EXPORT CHECK-INS CSV" downloads every check-in across all 4 days,
  with the date and exact time of each scan.

======================================================================
HOW MANAGE REGISTRATIONS WORKS
======================================================================
- Scroll to "Manage Registrations" on the admin dashboard.
- Type a name or registration number to filter the list.
- Click Delete next to a registration and confirm the prompt.
- This permanently removes that registration and all of its check-in
  history for every day — there is no undo, so it's meant for fixing
  duplicate or mistaken entries, not general record-keeping.

======================================================================
FEATURES (unchanged from earlier versions)
======================================================================
- Shared Supabase database
- Automatic EYF registration number
- QR code for every registration
- Phone-based registration
- Phone camera QR scanning
- Live total attendance + branch summary
- CSV export
- Realtime dashboard refresh
- Admin login using Supabase Auth
- All 18 branches included

IMPORTANT ADMIN SETUP
Create an admin user in your Supabase Dashboard under
Authentication > Users, if you haven't already. Use an email and
password for the registration team.

SECURITY
The public page can only insert registrations (and, after Step 1,
that insert actually works). The admin dashboard requires Supabase
authentication to read registrations, record check-ins, and delete
registrations. Do NOT put a service role key or your Brevo API key
in this website — the Brevo key lives only in Vercel's environment
variables, which are never exposed to the browser.

NEXT UPGRADES (still open)
- Edit (not just delete) a registration
- Registration card with the actual convention logo printed on it
- Multiple registration desk counters
- Admin roles
- Branch leaderboard
- Downloadable PDF cards
