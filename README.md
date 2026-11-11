# JFK Model UN

Static site with a Firebase member and admin portal. It can be hosted on GitHub Pages.

## Firebase setup

1. Create a Firebase project on the no-cost Spark plan. Add a Web app in Project settings and paste its `firebaseConfig` values into `firebase-config.js`.
2. In Authentication, enable Email/Password and Google sign-in. Add the GitHub Pages or custom site hostname under Authorized domains.
3. Create a Cloud Firestore database. In Firestore > Rules, replace the rules with `firestore.rules` and publish them. Do not use test mode rules in production.
4. Publish the site on GitHub Pages. No build step is needed. Serve it over HTTPS.
5. Sign in through `portal.html`. In Firebase Authentication, copy the account's User UID. In Firestore, create a document in the `admins` collection with that UID as its document ID; add a boolean field `enabled` set to `true`. The admin dashboard then appears in the member portal.

The Firebase web configuration is public by design. Firestore rules protect member data. Never put a service account key in this repository.

## Portal

Admins create a conference with dates, location, overview, and preference questions. Each conference has its own management view for reviewing applications, opening or closing signups, and assigning committees. Members see a conference directory and a dedicated view for each open signup. Their own submissions and committee placements remain visible after a signup closes. Closed conference details are not broadly readable under the current Firestore rules, so the member view uses their saved submission and assignment details for past conferences.

To run locally, use `python3 -m http.server 8000` from this directory and open `http://localhost:8000/portal.html`. Add `localhost` to Firebase Authentication's Authorized domains for local sign-in.
