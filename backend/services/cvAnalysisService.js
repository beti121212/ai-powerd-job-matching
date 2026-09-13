const fs = require('fs/promises');
const path = require('path');
const mammoth = require('mammoth');

const CV_FIELDS = ['fullName', 'email', 'phone', 'headline', 'skills', 'experience', 'education', 'certifications', 'languages'];
const INVALID_MARKERS = ['invoice', 'electric bill', 'utility bill', 'receipt', 'bank statement', 'purchase order', 'table of contents'];
const SECTION_MARKERS = ['resume', 'curriculum vitae', 'professional summary', 'summary', 'experience', 'employment', 'work history', 'career', 'projects', 'professional background', 'internship', 'roles', 'education', 'academic', 'university', 'college', 'degree', 'bsc', 'msc', 'diploma', 'studies', 'school', 'certifications', 'skills', 'technologies', 'tools', 'competencies', 'proficiencies', 'expertise', 'stack', 'languages', 'abilities', 'objective'];
const LOCATION_WORDS = ['addis ababa', 'ethiopia', 'nairobi', 'kenya', 'lagos', 'nigeria', 'kigali', 'rwanda', 'dire dawa', 'bahir dar'];
const SKILL_CATALOG = {
  technical: ['javascript', 'typescript', 'react', 'next.js', 'node.js', 'nodejs', 'express', 'python', 'java', 'c#', 'c++', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'html', 'css', 'tailwind', 'php', 'laravel', 'django', 'flask', 'spring', 'machine learning', 'data analysis', 'networking', 'linux', 'cisco packet tracer', 'rest api', 'graphql', 'terraform', 'jenkins', 'figma', 'excel', 'power bi'],
  soft: ['communication', 'leadership', 'teamwork', 'problem solving', 'time management', 'adaptability', 'collaboration', 'critical thinking', 'team leadership', 'project management'],
};

async function extractText(file) {
  const buffer = await fs.readFile(file.path);
  const extension = path.extname(file.originalname).toLowerCase();
  if (extension === '.txt') return normalizeExtractedText(buffer.toString('utf8'));
  if (extension === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeExtractedText(result.value);
  }
  if (extension === '.pdf') {
    const parserModule = require('pdf-parse');
    if (typeof parserModule === 'function') return normalizeExtractedText((await parserModule(buffer)).text || '');
    const parser = new parserModule.PDFParse({ data: buffer });
    try { return normalizeExtractedText((await parser.getText()).text || ''); } finally { await parser.destroy(); }
  }
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) {
    const { createWorker } = require('tesseract.js');
    const worker = await createWorker('eng');
    try { return ((await worker.recognize(buffer)).data.text || '').trim(); } finally { await worker.terminate(); }
  }
  throw new Error('Unsupported CV file type.');
}

function normalizeExtractedText(value) {
  return String(value || '')
    .replace(/\u0000/g, '')
    .normalize('NFKC')
    .replace(/[\u00a0\u2000-\u200b\u2028\u2029]/g, ' ')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

const CV_CONTENT_ERROR = 'We could not identify enough CV content. Please upload a readable resume containing your name or contact details and work history, projects, internships, or education.';
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /(?:\+251\s?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|09\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\+?\d[\d\s().-]{7,}\d)/;
const EXPERIENCE_PATTERN = /\b(experience|employment|work\s+history|career|career\s+history|professional\s+background|background|projects?|internships?|roles?|responsibilities|work\s+experience|employment\s+history)\b/i;
const EDUCATION_PATTERN = /\b(education|academic|academic\s+history|studies|qualifications?|university|college|degree|b\.?\s?sc|m\.?\s?sc|diploma|school|certifications?)\b/i;
const SKILLS_PATTERN = /\b(skills?|technologies|tools|competencies|proficiencies|expertise|stack|languages|abilities)\b/i;
const CONTACT_LABEL_PATTERN = /\b(phone|mobile|contact|linkedin|github|address|email)\b/i;
const NAME_PATTERN = /(?:^|\n)\s*[A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+){1,3}\s*(?:\n|$)/m;
const CV_REJECTION_MARKERS = /\b(invoice|receipt|bill|bank statement|utility bill|purchase order)\b/i;
const NON_CV_DOCUMENT_MARKERS = /\b(course\s+(outline|description|material|handout)|course\s+syllabus|syllabus|learning\s+outcomes?|assignments?|semester|lecture\s+notes?|chapter\s+\d+|table\s+of\s+contents?)\b/i;

function looksLikeCv(text) {
  const source = normalizeExtractedText(text);
  const lower = source.toLowerCase();
  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const hasContact = Boolean(source.match(EMAIL_PATTERN) || PHONE_PATTERN.test(source) || CONTACT_LABEL_PATTERN.test(lower) || NAME_PATTERN.test(source));
  const hasCareerEvidence = EXPERIENCE_PATTERN.test(lower) || /\b(developer|engineer|designer|analyst|manager|intern|administrator|consultant|technician|responsibilit|employment|professional)\b/i.test(lower);
  const hasEducationEvidence = EDUCATION_PATTERN.test(lower) || /\b(bachelor|master|phd|bsc|msc|diploma|university|college|degree)\b/i.test(lower);
  const isObviousNonCv = NON_CV_DOCUMENT_MARKERS.test(lower) || CV_REJECTION_MARKERS.test(lower);
  return Boolean(source) && wordCount >= 20 && hasContact && (hasCareerEvidence || hasEducationEvidence) && !isObviousNonCv;
}

function validateCvContent(text) {
  const source = normalizeExtractedText(text);
  const lower = source.toLowerCase();
  const email = source.match(EMAIL_PATTERN)?.[0] || '';
  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const sections = {
    experience: EXPERIENCE_PATTERN.test(lower),
    education: EDUCATION_PATTERN.test(lower),
    skills: SKILLS_PATTERN.test(lower),
    contact: Boolean(email || PHONE_PATTERN.test(source) || CONTACT_LABEL_PATTERN.test(lower) || NAME_PATTERN.test(source)),
  };
  const hasProfessionalHistory = sections.experience || sections.education;
  const rejectedDocument = NON_CV_DOCUMENT_MARKERS.test(lower) || CV_REJECTION_MARKERS.test(lower);
  const tooShallow = wordCount < 20;
  const valid = Boolean(source) && !rejectedDocument && sections.contact && hasProfessionalHistory && !tooShallow;
  let message = null;
  if (!source) message = 'We could not read any text from this document. Please upload a text-based PDF or DOCX, not a blank or image-only file.';
  else if (tooShallow) message = 'We could not read enough text from this document. Please make sure the CV is not blank or image-only.';
  else if (!sections.contact) message = 'We could not find contact details in this document. Please include an email address or phone number.';
  else if (!hasProfessionalHistory || rejectedDocument) message = CV_CONTENT_ERROR;
  const needsAiReview = !valid && !rejectedDocument && wordCount >= 20 && sections.contact && hasProfessionalHistory;
  return { valid, needsAiReview, sections, wordCount, normalizedText: source, message };
}

function normalizeSkill(value) {
  return String(value || '').toLowerCase().trim().replace(/nodejs/g, 'node.js').replace(/problem-solving/g, 'problem solving');
}

function skillObject(value, category) {
  const name = normalizeSkill(typeof value === 'string' ? value : value?.skill_name || value?.name);
  if (!name) return null;
  return { skill_name: name, skill_category: String(typeof value === 'object' ? value.skill_category || category : category), proficiency_level: typeof value === 'object' && value.proficiency_level ? value.proficiency_level : 'intermediate', years_of_experience: typeof value === 'object' ? value.years_of_experience ?? null : null };
}

function titleCaseName(value) {
  return String(value || '').replace(/[^A-Za-z\s'-]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).map((part) => part.split(/([-'])/).map((piece) => /[-']/.test(piece) ? piece : piece.charAt(0).toUpperCase() + piece.slice(1).toLowerCase()).join('')).join(' ');
}

function splitName(value) {
  const parts = titleCaseName(value).split(' ').filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' '), fullName: parts.join(' ') };
}

function extractLabeledName(text) {
  const source = String(text || '').replace(/\r/g, '\n');
  const firstName = source.match(/\b(?:first\s*name|given\s*name)\s*[:\-]\s*([A-Za-z][A-Za-z'\-]*(?:\s+[A-Za-z][A-Za-z'\-]*){0,3}?)(?=[,;\s]+(?:last\s*name|surname|family\s*name|email|phone|mobile)\b|\n|$)/i)?.[1]?.trim() || '';
  const lastName = source.match(/\b(?:last\s*name|surname|family\s*name)\s*[:\-]\s*([A-Za-z][A-Za-z'\-]*(?:\s+[A-Za-z][A-Za-z'\-]*){0,3}?)(?=[,;\s]+(?:first\s*name|given\s*name|email|phone|mobile)\b|\n|$)/i)?.[1]?.trim() || '';
  if (!firstName && !lastName) return { firstName: '', lastName: '', fullName: '' };
  return { firstName: titleCaseName(firstName), lastName: titleCaseName(lastName), fullName: [firstName, lastName].filter(Boolean).map(titleCaseName).join(' ') };
}

function normalizeName(value, text, email) {
  const candidate = String(value || '').replace(/^name\s*:\s*/i, '').replace(/\s+/g, ' ').trim();
  const lower = candidate.toLowerCase();
  const roleWords = /engineer|developer|specialist|manager|analyst|consultant|administrator|designer|student|professional|coordinator/;
  if (candidate && candidate.split(' ').length >= 2 && candidate.split(' ').length <= 4 && !LOCATION_WORDS.some((place) => lower.includes(place)) && !roleWords.test(lower)) return titleCaseName(candidate);
  const lines = String(text || '').split(/\r?\n/).map((line) => line.replace(/[^A-Za-z\s'-]/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 3);
  const heading = lines.find((line) => {
    const words = line.split(' ');
    const lowerLine = line.toLowerCase();
    return words.length >= 2 && words.length <= 3 && words.every((word) => /^[A-Z][a-z'-]+$/.test(word) || /^[A-Z]+$/.test(word)) && !LOCATION_WORDS.some((place) => lowerLine.includes(place)) && !SECTION_MARKERS.includes(lowerLine) && !roleWords.test(lowerLine);
  });
  if (heading) return titleCaseName(heading);
  const prefix = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\d+/g, ' ').trim();
  return titleCaseName(prefix);
}

function cleanAnalysis(value) {
  const analysis = value && typeof value === 'object' ? value : {};
  const skillGroups = analysis.skills && !Array.isArray(analysis.skills) ? analysis.skills : {};
  const skills = (Array.isArray(analysis.skills) ? analysis.skills : [
    ...(skillGroups.technical || []).map((item) => skillObject(item, 'technical')),
    ...(skillGroups.tools || []).map((item) => skillObject(item, 'tools')),
    ...(skillGroups.soft || []).map((item) => skillObject(item, 'soft')),
  ]).map((item) => skillObject(item, item?.skill_category || 'technical')).filter(Boolean).filter((item, index, list) => list.findIndex((candidate) => candidate.skill_name === item.skill_name) === index);
  const email = String(analysis.email || '').trim().match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const labeledName = extractLabeledName(analysis.rawText);
  const fullName = labeledName.fullName || normalizeName(analysis.fullName || analysis.full_name, analysis.rawText, email);
  const name = labeledName.fullName ? labeledName : splitName(analysis.fullName || analysis.full_name || fullName);
  const firstName = labeledName.firstName || analysis.firstName || name.firstName;
  const lastName = labeledName.lastName || analysis.lastName || name.lastName;
  const education = Array.isArray(analysis.education) ? analysis.education.map((item) => ({ school_name: item.institution || item.school_name || null, degree: item.degree || null, field_of_study: item.field_of_study || null, start_date: item.start_date || null, end_date: item.end_date || null, graduationYear: item.graduationYear || null, gpa: item.gpa || null, is_current: Boolean(item.is_current), description: item.description || null })) : [];
  const experience = Array.isArray(analysis.experience) ? analysis.experience.map((item) => ({ company_name: item.company || item.company_name || null, job_title: item.role || item.job_title || null, employment_type: item.employment_type || 'contract', location: item.location || null, start_date: item.start_date || null, end_date: item.end_date || null, duration: item.duration || null, is_current: Boolean(item.is_current || /present|current/i.test(item.duration || '')), description: Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : item.description || null, responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [], years_of_experience: item.years_of_experience ?? null })) : [];
  return {
    is_cv: analysis.is_cv === true,
    full_name: name.fullName,
    fullName: name.fullName,
    firstName,
    lastName,
    email,
    phone: String(analysis.phone || '').replace(/[^+\d\s().-]/g, '').replace(/\s+/g, ' ').trim(),
    professional_title: String(analysis.professional_title || analysis.headline || '').trim(),
    headline: String(analysis.headline || analysis.professional_title || '').trim(),
    location: String(analysis.location || '').trim(),
    skills,
    skillGroups: { technical: skills.filter((item) => item.skill_category === 'technical').map((item) => item.skill_name), tools: skills.filter((item) => item.skill_category === 'tools').map((item) => item.skill_name), soft: skills.filter((item) => item.skill_category === 'soft').map((item) => item.skill_name) },
    experience,
    education,
    certifications: Array.isArray(analysis.certifications) ? analysis.certifications : [],
    languages: Array.isArray(analysis.languages) ? analysis.languages : [],
    recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    extractedSummary: String(analysis.extractedSummary || analysis.summary || '').trim(),
    rawText: String(analysis.rawText || '').trim(),
  };
}

function dateFromText(value) {
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? `${match[0]}-01-01` : null;
}

function localParse(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const lower = text.toLowerCase();
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = text.match(/(?:\+251\s?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|09\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, ' ').trim() || '';
  const fullName = normalizeName('', text, email);
  const location = lines.find((line) => LOCATION_WORDS.some((place) => line.toLowerCase().includes(place))) || '';
  const rolePattern = /developer|engineer|designer|manager|analyst|consultant|specialist|administrator|accountant|agronomist|agriculture|biologist|biology|nurse|nursing|teacher|teaching|lecturer|professor|researcher|scientist|pharmacist|physician|doctor|healthcare|sales|marketing|human resources|operations|officer|coordinator|assistant|farmer|student|professional/i;
  const titleLine = lines.find((line) => rolePattern.test(line) && line.length < 100) || '';
  const skills = Object.entries(SKILL_CATALOG).flatMap(([category, catalog]) => catalog.filter((skill) => lower.includes(skill)).map((skill) => ({ skill_name: skill, skill_category: category, proficiency_level: 'intermediate', years_of_experience: null })));
  const uniqueSkills = skills.filter((skill, index, list) => list.findIndex((item) => item.skill_name === skill.skill_name) === index);
  const education = lines.filter((line) => /university|college|school|institute|bachelor|master|phd|degree|diploma|b\.sc|m\.sc/i.test(line)).slice(0, 5).map((line) => ({ school_name: /university|college|school|institute/i.test(line) ? line.replace(/\s*[|,].*$/, '').trim() : null, degree: line.match(/(?:b\.?\s?sc|m\.?\s?sc|bachelor(?:'s)?|master(?:'s)?|phd|doctorate|diploma)[^,|;]*/i)?.[0]?.trim() || null, field_of_study: null, graduationYear: line.match(/\b(?:19|20)\d{2}\b/)?.[0] || null, start_date: dateFromText(line), end_date: line.match(/\b(?:19|20)\d{2}\b/)?.[0] ? `${line.match(/\b(?:19|20)\d{2}\b/)[0]}-01-01` : null, is_current: false, description: null }));
  const experience = lines.filter((line) => rolePattern.test(line) && !/skill|education|summary|qualification/i.test(line)).slice(0, 5).map((line) => ({ company_name: line.split(/\s+at\s+|\s+@\s+|\s+\|\s+/i)[1]?.split(/\s+(?:19|20)\d{2}/)[0]?.trim() || null, job_title: line.split(/\s+at\s+|\s+@\s+|\s+\|\s+/i)[0]?.slice(0, 100).trim() || line.slice(0, 100), employment_type: 'contract', location: null, start_date: dateFromText(line), end_date: null, duration: line.match(/(?:19|20)\d{2}\s*[-–]\s*(?:(?:19|20)\d{2}|present|current)/i)?.[0] || null, is_current: /present|current/i.test(line), description: line, responsibilities: [], years_of_experience: null }));
  const certifications = lines.filter((line) => /certified|certification|certificate|aws|scrum|pmp/i.test(line)).slice(0, 5).map((line) => ({ name: line, issuer: null, date: dateFromText(line) }));
  const languages = lines.filter((line) => /english|amharic|french|german|spanish|arabic/i.test(line)).slice(0, 5).map((line) => ({ language_name: line, proficiency: 'professional-working' }));
  const isCv = looksLikeCv(text);
  return cleanAnalysis({ is_cv: isCv, full_name: fullName, email, phone, location, professional_title: titleLine, skills: uniqueSkills, experience, education, certifications, languages, rawText: text, recommendations: ['Add specific achievements and measurable results to your experience entries.'] });
}

function calculateScores(analysis, text) {
  const presentFields = CV_FIELDS.filter((field) => (Array.isArray(analysis[field]) ? analysis[field].length > 0 : Boolean(analysis[field]))).length;
  const lower = text.toLowerCase();
  const sectionHits = SECTION_MARKERS.filter((section) => lower.includes(section)).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const readability = Math.max(0, Math.min(100, Math.round(35 + Math.min(words / 8, 35) + Math.min(sectionHits * 5, 30))));
  const keywordMatch = Math.max(0, Math.min(100, Math.round(40 + (analysis.skills.length > 0 ? 25 : 0) + (analysis.education.length > 0 ? 20 : 0) + (analysis.experience.length > 0 ? 15 : 0))));
  const profileCompletion = Math.round((presentFields / CV_FIELDS.length) * 100);
  const cvScore = Math.round(readability * 0.35 + keywordMatch * 0.35 + profileCompletion * 0.3);
  return { cvScore, readability, keywordMatch, profileCompletion };
}

function calculateRealJobMatch(candidateSkills = [], activeJobs = []) {
  if (!candidateSkills.length || !activeJobs.length) return 0;
  const normalizedCandidateSkills = candidateSkills
    .map((skill) => (typeof skill === 'string' ? skill : skill.skill_name))
    .filter(Boolean)
    .map((skill) => skill.toLowerCase().trim());
  let totalMatch = 0;
  let evaluatedJobs = 0;

  for (const job of activeJobs) {
    const jobSkills = Array.isArray(job.required_skills)
      ? job.required_skills
      : typeof job.required_skills === 'string'
        ? (() => {
          try { return JSON.parse(job.required_skills); } catch { return job.required_skills.split(','); }
        })()
        : [];
    const normalizedJobSkills = jobSkills
      .map((skill) => (typeof skill === 'string' ? skill : skill.skill_name))
      .filter(Boolean)
      .map((skill) => skill.toLowerCase().trim());
    if (!normalizedJobSkills.length) continue;
    const matched = normalizedJobSkills.filter((skill) => normalizedCandidateSkills.includes(skill));
    totalMatch += (matched.length / normalizedJobSkills.length) * 100;
    evaluatedJobs += 1;
  }

  return evaluatedJobs ? Math.round(totalMatch / evaluatedJobs) : 0;
}

function normalizeMatchText(value) {
  return String(value || '').toLowerCase().replace(/nodejs/g, 'node.js').replace(/[^a-z0-9+#.]+/g, ' ').trim();
}

function toSkillNames(skills) {
  return new Set((Array.isArray(skills) ? skills : []).map((skill) => normalizeSkill(typeof skill === 'string' ? skill : skill?.skill_name || skill?.name)).filter(Boolean));
}

function parseJobSkills(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try { return JSON.parse(value); } catch { return String(value).split(','); }
}

function calculateJobMatches(candidate, activeJobs = []) {
  const candidateSkillNames = toSkillNames(candidate?.skills);
  const candidateTitle = normalizeMatchText([
    candidate?.headline,
    candidate?.professional_title,
    ...(candidate?.experience || []).map((item) => item?.job_title || item?.role),
  ].join(' '));
  const candidateEducation = normalizeMatchText((candidate?.education || []).map((item) => [item?.degree, item?.field_of_study, item?.institution].join(' ')).join(' '));
  const educationRank = { 'high-school': 1, associate: 2, bachelor: 3, master: 4, phd: 5 };

  return activeJobs.map((job) => {
    const requiredSkills = parseJobSkills(job.required_skills).map((skill) => normalizeSkill(typeof skill === 'string' ? skill : skill?.skill_name)).filter(Boolean);
    const uniqueRequiredSkills = [...new Set(requiredSkills)];
    const matchedSkills = uniqueRequiredSkills.filter((skill) => candidateSkillNames.has(skill));
    const skillScore = uniqueRequiredSkills.length ? matchedSkills.length / uniqueRequiredSkills.length : 0;
    const jobTitleTokens = new Set(normalizeMatchText(job.title).split(' ').filter((token) => token.length > 2));
    const candidateTitleTokens = new Set(candidateTitle.split(' ').filter((token) => token.length > 2));
    const titleScore = jobTitleTokens.size ? [...jobTitleTokens].filter((token) => candidateTitleTokens.has(token)).length / jobTitleTokens.size : 0;
    const requiredEducation = String(job.required_education || 'any').toLowerCase();
    const educationScore = requiredEducation === 'any' || (educationRank[requiredEducation] && Object.keys(educationRank).some((level) => educationRank[level] >= educationRank[requiredEducation] && candidateEducation.includes(level))) ? 1 : 0;
    const score = Math.round((skillScore * 60 + titleScore * 25 + educationScore * 15) * 100) / 100;
    return { ...job, required_skills: uniqueRequiredSkills, matched_skills: matchedSkills, match_breakdown: { skills: Math.round(skillScore * 100), title: Math.round(titleScore * 100), education: Math.round(educationScore * 100) }, match_score: score };
  }).sort((left, right) => right.match_score - left.match_score || left.id - right.id);
}

function buildPrompt(text) {
  return `You are a conservative CV extraction engine. Return ONLY valid JSON matching this schema. Never invent data. Never use "Not specified" or "Unknown"; use null or []. A city/country is never a person's name. Choose fullName from an explicit name heading or corroborate it with the email prefix; reject headings such as Addis Ababa, Ethiopia, Resume, or Curriculum Vitae. Normalize every skill to lowercase and put it in technical, tools, or soft. Keep real company and institution names only; for missing values use null.\nSchema: {"is_cv":true,"fullName":"string","email":"string","phone":"string","location":"string","headline":"string","education":[{"degree":"string|null","institution":"string|null","graduationYear":"string|null","gpa":"string|null"}],"experience":[{"role":"string|null","company":"string|null","duration":"string|null","responsibilities":["string"]}],"skills":{"technical":["string"],"tools":["string"],"soft":["string"]},"extractedSummary":"string"}.\nDOCUMENT:\n${text.slice(0, 50000)}`;
}

async function analyzeWithOpenAI(text) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_CV_MODEL || 'gpt-4o-mini', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Return conservative resume JSON only.' }, { role: 'user', content: buildPrompt(text) }] }) });
  if (!response.ok) throw new Error(`OpenAI returned HTTP ${response.status}`);
  const payload = await response.json();
  return cleanAnalysis(JSON.parse(payload.choices?.[0]?.message?.content || '{}'));
}

async function analyzeWithGemini(text) {
  const { GoogleGenAI } = require('@google/genai');
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({ model: process.env.GEMINI_CV_MODEL || 'gemini-2.0-flash', contents: buildPrompt(text), config: { temperature: 0, responseMimeType: 'application/json' } });
  const content = typeof response.text === 'function' ? response.text() : response.text;
  return cleanAnalysis(JSON.parse(content || '{}'));
}

async function classifyAndExtract(text) {
  const local = localParse(text);
  if (!local.is_cv) return { ...local, ai_provider: 'fallback_parser', is_fallback: true };
  const providers = [];
  if (process.env.OPENAI_API_KEY) providers.push(['openai', analyzeWithOpenAI]);
  if (process.env.GEMINI_API_KEY) providers.push(['gemini', analyzeWithGemini]);
  for (const [provider, analyzer] of providers) {
    try {
      const analysis = await analyzer(text);
      return cleanAnalysis({ ...analysis, rawText: text, is_cv: analysis.is_cv === true || local.is_cv, ai_provider: provider, is_fallback: false });
    } catch (error) {
      console.error(`${provider} CV analysis failed; trying fallback:`, error.message);
    }
  }
  return { ...local, ai_provider: 'fallback_parser', is_fallback: true };
}

module.exports = { extractText, classifyAndExtract, calculateScores, calculateRealJobMatch, calculateJobMatches, validateCvContent, CV_CONTENT_ERROR, localParse };
