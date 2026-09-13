import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Send,
} from 'lucide-react';
import contactImg from '../pages/images/contact.jpg';
import contactPhoneImg from '../pages/images/contactp.jpg';
import contactLocationImg from '../utils/contactl.jpg';
import hoursImg from './houres.jpg';
import aiTeamImg from '../pages/images/peoples.jpg';
import workplaceImg from '../pages/images/images.jpg';
import collaborationImg from '../pages/images/images (1).jpg';
import api from '../services/api';

const contactInfo = [
  {
    title: 'Email Us',
    value: 'support@jobmatching.ai',
    description: 'Get help with your account, CV, profile, or AI matching questions.',
    icon: Mail,
    href: 'mailto:support@jobmatching.ai',
  },
  {
    title: 'Call Us',
    value: '0952748973',
    description: 'Available during business hours for urgent support.',
    icon: Phone,
    href: 'tel:0952748973',
  },
  {
    title: 'Visit Us',
    value: 'Addis Ababa, Ethiopia',
    description: 'Supporting job seekers and employers across Ethiopia.',
    icon: MapPin,
    href: 'https://www.google.com/maps/search/?api=1&query=Addis%20Ababa%2C%20Ethiopia',
  },
  {
    title: 'Business Hours',
    value: 'Monday - Friday',
    description: '8:00 AM - 5:00 PM',
    icon: Clock3,
  },
];

const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: Globe2 },
  { name: 'Facebook', url: 'https://facebook.com', icon: Globe2 },
  { name: 'Instagram', url: 'https://instagram.com', icon: Globe2 },
  { name: 'Telegram', url: 'https://t.me', icon: MessageCircle },
  { name: 'WhatsApp', url: 'https://wa.me/251900000000', icon: MessageCircle },
];

const contactGallery = [
  { image: contactImg, title: 'Direct support', alt: 'Support specialist ready to answer questions' },
  { image: contactPhoneImg, title: 'Talk with our team', alt: 'Professional speaking on a phone' },
  { image: aiTeamImg, title: 'AI matching support', alt: 'Team collaborating around an AI job matching platform' },
  { image: workplaceImg, title: 'Career guidance', alt: 'Professional working with a laptop' },
  { image: collaborationImg, title: 'Employer support', alt: 'Business team collaborating around a laptop' },
  { image: hoursImg, title: 'Support hours', alt: 'Support hours information' },
];

const faqs = [
  ['How does AI matching work?', 'The system analyzes the job seeker\'s skills, experience, education, and job requirements to calculate a matching score.'],
  ['How can I apply for a job?', 'Search for a suitable job, view its details, and click the Apply button to submit your application.'],
  ['How is the Match Score calculated?', 'The AI compares the job requirements with the job seeker\'s profile information and generates a matching score.'],
  ['Can employers post jobs?', 'Yes. Employers can create job postings and find suitable candidates through AI-powered matching.'],
  ['How can I update my profile or CV?', 'Open your profile section, update your information, and upload a current CV to improve your opportunities.'],
  ['How can I contact support?', 'Use the form below or email support@jobmatching.ai and we will respond during business hours.'],
];

const initialForm = { fullName: '', email: '', subject: '', message: '' };

function validateForm(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.subject.trim()) {
    errors.subject = 'Subject is required.';
  }

  if (!form.message.trim()) {
    errors.message = 'Message is required.';
  } else if (form.message.trim().length < 20) {
    errors.message = 'Message must be at least 20 characters.';
  } else if (form.message.length > 1000) {
    errors.message = 'Message must be 1000 characters or fewer.';
  }

  return errors;
}

function FieldError({ children }) {
  return children ? <p className="mt-1 text-xs font-semibold text-red-600">{children}</p> : null;
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSending(true);
    try {
      await api.post('/contact', form);
      setIsSending(false);
      setIsSent(true);
    } catch (error) {
      setIsSending(false);
      setErrors({ submit: error.response?.data?.message || 'Unable to send your message right now.' });
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setIsSent(false);
  };

  return (
    <main className="bg-brand-soft/40 text-slate-800">
      <section className="relative overflow-hidden border-b border-[var(--brand-border)] bg-[#edf3f7] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[var(--brand-border)]" />
        <div className="relative mx-auto flex max-w-[1320px] justify-center">
          <div className="relative z-10 w-full max-w-[900px] text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white/85 px-4 py-2 text-[0.64rem] font-black uppercase tracking-[0.22em] text-sky-700 shadow-sm backdrop-blur-sm">
              <MessageSquareText className="h-3.5 w-3.5" />
              Contact Us
            </div>

            <h1 className="text-[1.1rem] font-black leading-tight tracking-[-0.02em] text-slate-950 sm:text-[1.5rem] lg:text-[2rem] xl:text-[2.25rem] lg:whitespace-nowrap">
              <span>Need help with </span>
              <span><span className="text-[var(--brand-primary)]">your AI</span> job matching?</span>
            </h1>

            <p className="mx-auto mt-3 max-w-none text-xs leading-5 text-slate-600 sm:text-sm lg:whitespace-nowrap">
              We help job seekers, employers, and administrators resolve account, profile, CV, and AI matching questions quickly and clearly.
            </p>
          </div>

        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6">
            {contactGallery.map(({ image, title, alt }) => (
              <figure key={title} className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <img src={image} alt={alt} className="aspect-[1.42] w-full object-cover transition duration-500 hover:scale-105" />
                <figcaption className="bg-white px-5 py-4 text-base font-bold text-slate-900">{title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto grid max-w-[1180px] gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {contactInfo.map(({ title, value, description, icon: Icon, href }) => {
            const cardContent = (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-sky-700 ring-1 ring-sky-200">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="mt-4 text-[1.25rem] font-black leading-tight tracking-[-0.02em] text-slate-950">{title}</h2>
                <p className="mt-2 break-words text-sm font-black leading-relaxed text-sky-700">{value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
              </>
            );
            const cardClassName = 'group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-lg';

            return href ? (
              <a key={title} href={href} aria-label={title === 'Call Us' ? 'Call 0952748973' : title === 'Email Us' ? 'Email support@jobmatching.ai' : 'Open Addis Ababa location in Google Maps'} target={title === 'Visit Us' ? '_blank' : undefined} rel={title === 'Visit Us' ? 'noreferrer' : undefined} className={cardClassName}>
                {cardContent}
              </a>
            ) : (
              <article key={title} className={cardClassName}>
                {cardContent}
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] brand-text">Contact Us</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Send Us a Message</h2>
            </div>

            {isSent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" />
                </span>
                <h3 className="mt-6 text-2xl font-black text-slate-900">Message Sent Successfully!</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Thank you for contacting us. Our support team will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl brand-bg px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Send Another Message
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <FieldError>{errors.submit}</FieldError>
                <label className="block text-sm font-bold text-slate-700">
                  Name
                  <input
                    value={form.fullName}
                    onChange={(event) => updateField('fullName', event.target.value)}
                    className="contact-input"
                    placeholder="Your full name"
                  />
                  <FieldError>{errors.fullName}</FieldError>
                </label>

                <label className="block text-sm font-bold text-slate-700">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="contact-input"
                    placeholder="you@example.com"
                  />
                  <FieldError>{errors.email}</FieldError>
                </label>

                <label className="block text-sm font-bold text-slate-700">
                  Subject
                  <input
                    value={form.subject}
                    onChange={(event) => updateField('subject', event.target.value)}
                    className="contact-input"
                    placeholder="Job Matching Problem"
                  />
                  <FieldError>{errors.subject}</FieldError>
                </label>

                <label className="block text-sm font-bold text-slate-700">
                  Message
                  <textarea
                    value={form.message}
                    onChange={(event) => updateField('message', event.target.value)}
                    rows={6}
                    className="contact-input resize-none"
                    placeholder="Write your message here..."
                  />
                  <FieldError>{errors.message}</FieldError>
                </label>

                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl brand-bg px-5 py-3 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </section>

          <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-[#dfeef9] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Location</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Addis Ababa, Ethiopia</h3>
            </div>

            <img
              src={contactLocationImg}
              alt="Map showing Ethiopia and Addis Ababa"
              className="block h-auto w-full object-contain"
            />

            <div className="h-[430px] w-full border-0">
              <iframe
                title="Addis Ababa map"
                src="https://www.google.com/maps?q=Addis%20Ababa%2C%20Ethiopia&z=11&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-sky-700" />
                <span>support@jobmatching.ai</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-sky-700" />
                <span>0952748973</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 text-sky-700" />
                <span>Monday - Friday, 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] brand-text">Need a quick answer?</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Frequently Asked Questions</h2>
          </div>

          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map(([question, answer], index) => (
              <div key={question}>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-800"
                >
                  <span>{question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 brand-text transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ${openFaq === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-6 text-slate-600">{answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}