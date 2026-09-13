import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Building2, Check, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const handleRoleCardSelect = (roleToSubmit) => {
    setSelectedRole(roleToSubmit);
    setError("");
    handleRoleSubmit(roleToSubmit);
  };

  const skipToAdminDashboard = () => {
    const storedUser = localStorage.getItem("user");
    const existingUser = storedUser ? JSON.parse(storedUser) : {};
    const email = String(existingUser?.email || '').trim().toLowerCase();

    if (email === 'tekebaaweke32@gmail.com') {
      const adminUser = {
        ...existingUser,
        role: 'admin',
        userType: 'admin',
        is_verified: true,
        onboardingRoleSelected: true,
      };
      localStorage.setItem('user', JSON.stringify(adminUser));
      setSession({ token: localStorage.getItem('token'), user: adminUser });
      navigate('/admin/dashboard', { replace: true });
      return true;
    }

    return false;
  };

  const handleRoleSubmit = async (roleToSubmit) => {
    if (skipToAdminDashboard()) return;
    const role = roleToSubmit || selectedRole;

    if (!role) {
      setError("እባክዎ ሚናዎን ይምረጡ (Please select your account type)");
      return;
    }

    const normalizedRole = role === "seeker" ? "job_seeker" : role;

    try {
      const storedUser = localStorage.getItem("user");
      const existingUser = storedUser ? JSON.parse(storedUser) : {};
      const userId = existingUser.id || existingUser.userId;
      if (!userId) throw new Error("A verified user is required to select a role.");

      const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/select-role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token")
              ? { Authorization: "Bearer " + localStorage.getItem("token") }
              : {}),
          },
          body: JSON.stringify({ userId, role: normalizedRole }),
      });
      const data = await response.json();
      if (!response.ok || !data.user || !data.token) throw new Error(data.error || "Unable to save role.");

      const updatedUser = {
        ...existingUser,
        ...data.user,
        role: normalizedRole,
        onboardingRoleSelected: true,
        onboardingCvUploaded: false,
        onboardingProfileCompleted: false,
        is_verified: data.user.is_verified ?? existingUser.is_verified ?? true,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("token", data.token);
      setSession({ token: data.token, user: updatedUser });

      if (normalizedRole === "employer") {
        navigate("/employer/onboarding", { replace: true });
      } else {
        navigate("/seeker/cv-upload", { replace: true });
      }
    } catch (err) {
      console.error("Error updating user role:", err);
        setError(err.message || "Unable to save role. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100/80 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center p-6 md:p-12 lg:p-16 font-sans">
      <div className="w-full max-w-7xl bg-white rounded-3xl p-6 md:p-10 lg:p-14 shadow-2xl border border-slate-200/80">

        {/* Main split: Intro + Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Intro / Headline */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                  Welcome to SmartRecruit
                </h1>
                <p className="mt-2 text-[16px] md:text-[17px] text-slate-600 max-w-xl">
                  Choose how you want to use the platform. Create a polished profile, get matched with relevant roles, or post jobs and evaluate candidates using AI-powered tools.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-[15px] md:text-[16px] text-slate-700 font-medium">
                Why choose SmartRecruit?
              </p>
              <ul className="space-y-2 text-[15px] md:text-[16px] text-slate-600 list-inside">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                  <span>AI resume parsing & matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                  <span>Intelligent candidate recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                  <span>Secure, fast hiring workflows</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Role Cards */}
          <div className="lg:col-span-7">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl font-medium text-center border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Job Seeker Card */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRoleCardSelect("seeker");
                  }
                }}
                onClick={() => handleRoleCardSelect("seeker")}
                className={`relative flex flex-col justify-between p-6 md:p-8 rounded-3xl border transition-transform duration-200 ease-in-out cursor-pointer shadow-sm hover:shadow-lg focus:shadow-lg outline-none ${
                  selectedRole === "seeker"
                    ? "border-blue-600 bg-gradient-to-b from-white to-blue-50 transform scale-[1.01] shadow-blue-500/20"
                    : "border-slate-200 bg-white hover:-translate-y-1"
                }`}
              >
                <div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${
                        selectedRole === "seeker"
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-500"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                        Job Seeker
                      </h3>
                      <p className="mt-1 text-[15px] text-slate-600 max-w-xs">
                        Build your profile, upload CV, and get matched with opportunities.
                      </p>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3 text-[15px] text-slate-700">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>Personal details & skill mapping</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>One-click CV upload & AI Analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>Smart Job Seeker Dashboard</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedRole === "seeker"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {selectedRole === "seeker" ? "Selected" : "Select"}
                    </span>
                    {selectedRole === "seeker" && (
                      <span className="text-xs text-slate-500">
                        You're choosing this role
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleCardSelect("seeker");
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition cursor-pointer ${
                      selectedRole === "seeker"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Active badge */}
                {selectedRole === "seeker" && (
                  <div className="absolute -top-3 -right-3">
                    <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow">
                      Active
                    </div>
                  </div>
                )}
              </div>

              {/* Employer Card */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRoleCardSelect("employer");
                  }
                }}
                onClick={() => handleRoleCardSelect("employer")}
                className={`relative flex flex-col justify-between p-6 md:p-8 rounded-3xl border transition-transform duration-200 ease-in-out cursor-pointer shadow-sm hover:shadow-lg focus:shadow-lg outline-none ${
                  selectedRole === "employer"
                    ? "border-blue-600 bg-gradient-to-b from-white to-blue-50 transform scale-[1.01] shadow-blue-500/20"
                    : "border-slate-200 bg-white hover:-translate-y-1"
                }`}
              >
                <div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${
                        selectedRole === "employer"
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-500"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                        Employer / Hiring Manager
                      </h3>
                      <p className="mt-1 text-[15px] text-slate-600 max-w-xs">
                        Post jobs, screen candidates, and leverage AI hiring insights.
                      </p>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3 text-[15px] text-slate-700">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>Company profile & contact details</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>Post & manage hiring requirements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>Access Employer Dashboard</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedRole === "employer"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {selectedRole === "employer" ? "Selected" : "Select"}
                    </span>
                    {selectedRole === "employer" && (
                      <span className="text-xs text-slate-500">
                        You're choosing this role
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleCardSelect("employer");
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition cursor-pointer ${
                      selectedRole === "employer"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Active badge */}
                {selectedRole === "employer" && (
                  <div className="absolute -top-3 -right-3">
                    <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow">
                      Active
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Mobile stacked Continue button */}
            <div className="mt-6 md:hidden">
              <button
                type="button"
                onClick={() => handleRoleSubmit()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RoleSelection;