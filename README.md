# JFK Model UN

Static site with a Firebase member portal. It can be hosted on GitHub Pages.

## Firebase setup

1. Create a Firebase project on the no-cost Spark plan. Add a Web app in Project settings and paste its `firebaseConfig` values into `firebase-config.js`.
2. In Authentication, enable Email/Password sign-in. Add the GitHub Pages hostname (usually `<username>.github.io`) under Authorized domains.
3. Create a Cloud Firestore database. In Firestore > Rules, replace the rules with the contents of `firestore.rules` and publish them. Do not use test mode rules in production.
4. Publish the site on GitHub Pages. No build step is needed. Ensure the page is served over HTTPS.
5. Create the first account through `portal.html`. In Firebase Authentication, copy its User UID. In Firestore, create a document in the `admins` collection with that UID as its document ID; add a field `enabled` (boolean) set to `true`. The admin can then sign in at `portal.html` and open `admin.html`.

The Firebase web configuration is public by design. Access to member data is controlled by Firestore rules. Never put a service account key in this repository.

Admins can publish or close a signup for each conference, review preferences, assign committees, and remove assignments. Members can submit each open conference signup once and see their own assignments. The signup questions are prefilled with grade, experience, committee and country preferences, and notes; admins can edit them before publishing.
