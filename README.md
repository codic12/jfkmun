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

Admins can add or edit dates, location, a displayed signup deadline, a conference overview, and up to 12 HTTPS resource links. Use separate label and HTTPS URL fields for each link. The deadline is informational; admins close signups from the conference page. Graduation year determines grade, and Model UN experience uses a selection field for new submissions. Applications are grouped by delegate in expandable rows.

## Delegate contact and roster

Delegates can add an optional phone number and choose email, text, or either as their contact preference in the member portal. Admins can open a conference's **Compact roster** to see a screenshot-friendly table of applicants and assigned delegates. Contact columns are hidden by default and can be included with the checkbox; **Print / save PDF** uses a landscape layout.

After changing `firestore.rules`, publish its updated contents in Firebase Console > Firestore > Rules. Until those rules are published, delegates cannot save contact information.

## Conference membership

Admins can use **Add to conference** to give a registered member access to the preference form without choosing a committee yet. Use **Assign committee** after reviewing preferences. Assigning a committee also adds the member to that conference. Members see officer assigned conferences under **My conferences** and can browse open signups under **Explore conferences**. Only members assigned to a conference can submit committee preferences. The portal hides the form until an officer assigns the member, and Firestore rules enforce the same requirement. Publish the updated `firestore.rules` in Firebase Console before using this feature; the new `conferenceMembers` collection is readable only by the assigned member and admins.


Admins can edit committee placements directly and maintain member names, graduation years, phone numbers, and contact preferences in **All delegates**. Email addresses are shown from sign in accounts.
