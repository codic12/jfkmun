import { auth, db, configured, escapeHtml as esc, message } from './firebase.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { collection, doc, getDoc, getDocs, query, where, addDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const authPanel = document.getElementById('auth-panel'), memberPanel = document.getElementById('member-panel');
if (!configured) message('Portal setup is pending. An administrator must add the Firebase web configuration.', true);
else onAuthStateChanged(auth, async user => {
  authPanel.hidden = !!user; memberPanel.hidden = !user;
  if (!user) return;
  document.getElementById('welcome').textContent = `Welcome, ${user.displayName || user.email}`;
  try {
    const admin = await getDoc(doc(db, 'admins', user.uid));
    document.getElementById('admin-link').hidden = !admin.exists();
    const [forms, submissions, assignments] = await Promise.all([
      getDocs(query(collection(db, 'forms'), where('open', '==', true))),
      getDocs(query(collection(db, 'submissions'), where('uid', '==', user.uid))),
      getDocs(query(collection(db, 'assignments'), where('uid', '==', user.uid)))
    ]);
    renderForms(forms.docs, new Set(submissions.docs.map(d => d.data().formId)));
    document.getElementById('submissions').innerHTML = submissions.empty ? '<p>No submissions yet.</p>' : submissions.docs.map(d => `<div class="portal-item"><h3>${esc(d.data().formTitle)}</h3><small>Submitted ${esc(d.data().createdAt?.toDate?.().toLocaleDateString() || 'recently')}</small></div>`).join('');
    document.getElementById('assignments').innerHTML = assignments.empty ? '<p>No committee assignments yet.</p>' : assignments.docs.map(d => `<div class="portal-item"><h3>${esc(d.data().conference)}</h3><p>${esc(d.data().committee)}${d.data().country ? ` — ${esc(d.data().country)}` : ''}</p></div>`).join('');
  } catch (e) { message(e.message, true); }
});
function renderForms(docs, submitted) {
  const container = document.getElementById('forms');
  container.innerHTML = docs.length ? docs.map(d => { const f=d.data(); return `<div class="portal-item"><h3>${esc(f.title)}</h3><p>${esc(f.description)}</p>${submitted.has(d.id) ? '<small>Submitted</small>' : `<form data-form-id="${esc(d.id)}">${(f.questions || []).map((q,i)=>`<label>${esc(q)}<textarea name="answer-${i}" required maxlength="2000"></textarea></label>`).join('')}<button type="submit">Submit</button></form>`}</div>`; }).join('') : '<p>No forms are open right now.</p>';
  container.querySelectorAll('form').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault(); const button=form.querySelector('button'); button.disabled=true;
    try { const id=form.dataset.formId, formDoc=await getDoc(doc(db,'forms',id)); if(!formDoc.exists() || !formDoc.data().open) throw Error('This form is closed.'); const questions=formDoc.data().questions || []; const answers=questions.map((question,i)=>({question,answer:form.elements[`answer-${i}`].value.trim()})); if(answers.some(a=>!a.answer)) throw Error('Complete every answer.'); await setDoc(doc(db,'submissions',`${auth.currentUser.uid}_${id}`), {uid:auth.currentUser.uid,formId:id,formTitle:formDoc.data().title,answers,createdAt:serverTimestamp()}); message('Form submitted.'); form.replaceWith(Object.assign(document.createElement('small'),{textContent:'Submitted'})); } catch(err){message(err.message,true);button.disabled=false;}
  }));
}
document.getElementById('auth-form').addEventListener('submit', async e => { e.preventDefault(); const action=e.submitter?.value || 'signin', email=document.getElementById('email').value.trim(), password=document.getElementById('password').value, name=document.getElementById('full-name').value.trim(); try { if(action==='register'){if(!name) throw Error('Enter your full name to create an account.'); const result=await createUserWithEmailAndPassword(auth,email,password); await updateProfile(result.user,{displayName:name}); await setDoc(doc(db,'profiles',result.user.uid),{name,email,createdAt:serverTimestamp()}); document.getElementById('welcome').textContent=`Welcome, ${name}`;} else await signInWithEmailAndPassword(auth,email,password); message('Signed in.'); } catch(err){message(err.message,true);} });
document.getElementById('reset-password').addEventListener('click',async()=>{const email=document.getElementById('email').value.trim();if(!email)return message('Enter your email address first.',true);try{await sendPasswordResetEmail(auth,email);message('Password reset email sent.');}catch(err){message(err.message,true);}});
document.getElementById('sign-out').addEventListener('click',()=>signOut(auth));
const toggle=document.querySelector('.nav-toggle');toggle.addEventListener('click',()=>document.querySelector('.nav-links').classList.toggle('active'));

document.getElementById('google-sign-in').addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const profile = doc(db, 'profiles', result.user.uid);
    if (!(await getDoc(profile)).exists()) {
      await setDoc(profile, {name: result.user.displayName || result.user.email, email: result.user.email, createdAt: serverTimestamp()});
    }
    message('Signed in with Google.');
  } catch (err) { message(err.message, true); }
});
