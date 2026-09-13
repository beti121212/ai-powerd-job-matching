import OverviewView from "./OverviewView";
import ExperienceView from "./ExperienceView";
import SkillsView from "./SkillsView";
import ProjectsView from "./ProjectsView";
import ServicesView from "./ServicesView";
import JobsView from "./JobsView";
import PromptStudioView from "./PromptStudioView";
import ContactView from "./ContactView";
import PlatformAboutView from "./PlatformAboutView";
import CreateProfileView from "./CreateProfileView";

export default function AboutView({ activeTab = "overview", onNavigate }) {
  const renderSection = () => {
    switch (activeTab) {
      case "about":
        return <PlatformAboutView onNavigate={onNavigate} />;
      case "createProfile":
        return <CreateProfileView />;
      case "overview":
        return <OverviewView onNavigate={onNavigate} />;
      case "about":
        return <OverviewView onNavigate={onNavigate} />;
      case "experience":
        return <ExperienceView />;
      case "skills":
        return <SkillsView />;
      case "projects":
        return <ProjectsView />;
      case "services":
        return <ServicesView />;
      case "jobs":
        return <JobsView />;
      case "about":
        return <OverviewView onNavigate={onNavigate} />;
      case "prompts":
      case "prompt-studio":
        return <PromptStudioView />;
      case "contact":
        return <ContactView />;
      case "create-profile":
      case "createProfile":
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900">Create / Edit Profile</h2>
            <p className="mt-2 text-slate-600">Add your experience, resume details, and AI-ready profile information to improve your match score.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Resume parser</p>
                <p className="mt-2 text-sm text-slate-600">Upload PDF or DOCX and extract skills, experience, and projects automatically.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Profile form</p>
                <p className="mt-2 text-sm text-slate-600">Update availability, headline, locations, work style, and public portfolio links.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <OverviewView onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {renderSection()}
    </div>
  );
}
