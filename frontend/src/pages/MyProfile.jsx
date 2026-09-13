import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  emptyProfile,
  getProfile,
  uploadAvatar,
  updatePersonalInfo,
  updateSkills,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addCertification,
  updateCertification,
  deleteCertification,
} from "../services/seekerProfileApi";
import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import DeleteConfirmationModal from "../components/profile/DeleteConfirmationModal";
import Toast from "../components/profile/Toast";
import EditPersonalInfoModal from "../components/profile/EditPersonalInfoModal";
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  CertificationsSection,
  ItemEditor,
} from "../components/profile/ProfileCrudSections";
import {
  continueApplicationFlow,
  getPendingApplication,
} from "../utils/applicationFlow";

const initial = { ...emptyProfile };
export default function MyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProfile((await getProfile()) || initial);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const completion = useMemo(() => {
    const checks = [
      profile.name,
      profile.email,
      profile.headline,
      profile.phone,
      profile.location,
      profile.bio,
      profile.education?.length,
      Object.values(profile.skills || {}).some((values) => values?.length),
      profile.experience?.length,
      profile.certifications?.length,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);
  const saveEditor = async (data) => {
    try {
      const key = editor.type;
      const item = editor.item;
      let result;
      if (key === "education")
        result = item
          ? await updateEducation(item.id, data)
          : await addEducation(data);
      if (key === "experience")
        result = item
          ? await updateExperience(item.id, data)
          : await addExperience(data);
      if (key === "certifications")
        result = item
          ? await updateCertification(item.id, data)
          : await addCertification(data);
      const listKey = key;
      setProfile((current) => ({
        ...current,
        [listKey]: item
          ? current[listKey].map((entry) =>
              String(entry.id) === String(item.id)
                ? { ...entry, ...data }
                : entry,
            )
          : [
              ...(current[listKey] || []),
              result || { ...data, id: Date.now() },
            ],
      }));
      setEditor(null);
      setToast(`${item ? "Item updated" : "Item added"} successfully!`);
    } catch (requestError) {
      setError(requestError?.message || "Unable to save this item.");
    }
  };
  const deleteItem = async () => {
    const { type, item } = deleteTarget;
    setDeleting(true);
    try {
      if (type === "education") await deleteEducation(item.id);
      if (type === "experience") await deleteExperience(item.id);
      if (type === "certifications") await deleteCertification(item.id);
      setProfile((current) => ({
        ...current,
        [type]: current[type].filter(
          (entry) => String(entry.id) !== String(item.id),
        ),
      }));
      setDeleteTarget(null);
      setToast("Item deleted.");
    } catch (requestError) {
      setError(requestError?.message || "Unable to delete this item.");
    } finally {
      setDeleting(false);
    }
  };
  const savePersonal = async (data) => {
    try {
      await updatePersonalInfo(data);
      setProfile((current) => ({ ...current, ...data }));
      setToast("Personal information updated!");
      const pending = getPendingApplication();
      if (pending?.jobId)
        continueApplicationFlow(navigate, { jobId: pending.jobId });
    } catch (requestError) {
      setError(
        requestError?.message || "Unable to update personal information.",
      );
    }
  };
  const saveSkills = async () => {
    const value = window.prompt(
      "Enter skills separated by commas",
      Object.values(profile.skills || {})
        .flat()
        .map((skill) => skill.name || skill)
        .join(", "),
    );
    if (value === null) return;
    const skills = {
      Technical: value
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };
    await updateSkills(skills);
    setProfile((current) => ({ ...current, skills }));
    setToast("Skills updated!");
  };
  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadAvatar(file);
      setProfile((current) => ({ ...current, avatarUrl: result.avatarUrl }));
      setToast("Avatar updated!");
    } catch (requestError) {
      setError(requestError?.message || "Unable to upload avatar.");
    }
  };
  if (loading)
    return (
      <main className="information-page min-h-[70vh] bg-slate-50 p-10">
        <div className="flex justify-center rounded-2xl bg-white p-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      </main>
    );
  const deleteLabels = {
    education: "education",
    experience: "experience",
    certifications: "certification",
  };
  return (
    <main className="information-page min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-deep)]">
              Candidate workspace
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              My Profile
            </h1>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <ProfileHeader
          profile={profile}
          completion={completion}
          onEdit={() => navigate("/profile/edit")}
          onAvatarChange={handleAvatar}
        />
        <PersonalInfoCard
          profile={profile}
          onEdit={() => setEditor({ type: "personal", item: profile })}
          onAvatarChange={handleAvatar}
        />
        <EducationSection
          items={profile.education || []}
          onAdd={() => setEditor({ type: "education" })}
          onEdit={(item) => setEditor({ type: "education", item })}
          onDelete={(item) => setDeleteTarget({ type: "education", item })}
        />
        <SkillsSection skills={profile.skills} onEdit={saveSkills} />
        <ExperienceSection
          items={profile.experience || []}
          onAdd={() => setEditor({ type: "experience" })}
          onEdit={(item) => setEditor({ type: "experience", item })}
          onDelete={(item) => setDeleteTarget({ type: "experience", item })}
        />
        <CertificationsSection
          items={profile.certifications || []}
          onAdd={() => setEditor({ type: "certifications" })}
          onEdit={(item) => setEditor({ type: "certifications", item })}
          onDelete={(item) => setDeleteTarget({ type: "certifications", item })}
          onView={(item) =>
            navigate(`/profile/certificates/${item.id}`, {
              state: { certificate: item },
            })
          }
        />
      </div>
      {editor?.type === "personal" && (
        <EditPersonalInfoModal
          profile={profile}
          onCancel={() => setEditor(null)}
          onSave={async (data) => {
            await savePersonal(data);
            setEditor(null);
          }}
        />
      )}
      {editor && editor.type !== "personal" && (
        <ItemEditor
          type={editor.type}
          item={editor.item}
          onCancel={() => setEditor(null)}
          onSave={saveEditor}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmationModal
          itemName={deleteLabels[deleteTarget.type]}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteItem}
          isDeleting={deleting}
        />
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </main>
  );
}
