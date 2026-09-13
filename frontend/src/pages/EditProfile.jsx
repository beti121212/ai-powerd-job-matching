import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateFullProfile } from "../services/seekerProfileApi";

export default function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userProfile") || "{}");
    } catch {
      return {};
    }
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const update = (key, value) =>
    setProfile((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateFullProfile(profile);
      setMessage("Profile updated successfully!");
      window.setTimeout(() => navigate("/profile"), 700);
    } finally {
      setSaving(false);
    }
  };
  return (
    <main className="information-page min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <form
        onSubmit={save}
        className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--brand-deep)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Profile
        </button>
        <h1 className="text-3xl font-black text-slate-900">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Update your candidate summary and professional links.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["name", "Full name"],
            ["headline", "Professional headline"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["location", "Location"],
            ["linkedin", "LinkedIn URL"],
            ["github", "GitHub URL"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-bold text-slate-700">
              {label}
              <input
                value={profile[key] || ""}
                onChange={(event) => update(key, event.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal"
              />
            </label>
          ))}
          <label className="text-sm font-bold text-slate-700 sm:col-span-2">
            Bio / summary
            <textarea
              value={profile.bio || ""}
              onChange={(event) => update("bio", event.target.value)}
              rows={6}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal"
            />
          </label>
        </div>
        {message && (
          <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
