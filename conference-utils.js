import { escapeHtml as esc } from './firebase.js';

export function renderResources(resources) {
  const safe = (resources || []).filter(item => {
    try { return new URL(item.url).protocol === 'https:'; } catch { return false; }
  });
  if (!safe.length) return '<p class="muted">Resources will appear here when the officers add them.</p>';
  return `<ul class="resource-list">${safe.map(item => `<li><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul>`;
}
export function answerField(question, index) {
  const q = String(question), name = `answer-${index}`, low = q.toLowerCase();
  if (/grade level|current grade/.test(low)) return `<label>${esc(q)}<select name="${name}" required><option value="">Choose your grade</option><option>9th grade</option><option>10th grade</option><option>11th grade</option><option>12th grade</option><option>Other</option></select></label>`;
  if (/previous model un experience|mun experience/.test(low)) return `<label>${esc(q)}<select name="${name}" required><option value="">Choose your experience</option><option>First conference</option><option>1–2 conferences</option><option>3 or more conferences</option></select></label>`;
  if (/notes|anything else/.test(low)) return `<label>${esc(q)} <span class="field-help">Optional</span><textarea name="${name}" maxlength="2000" placeholder="Anything officers should know?"></textarea></label>`;
  return `<label>${esc(q)}<input name="${name}" required maxlength="2000" placeholder="Your answer"></label>`;
}
