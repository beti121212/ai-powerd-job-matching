CREATE DATABASE IF NOT EXISTS job_matching;
USE job_matching;

-- MySQL Strict Mode ገደቦችን ለማስወገድ
SET SQL_MODE = '';

-- ============================================================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose ENUM('registration', 'password-reset', 'email-verification', 'login') DEFAULT 'registration',
    is_used BOOLEAN DEFAULT FALSE,
    attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_expires (email, expires_at)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NULL,
    role ENUM('super_admin', 'admin', 'employer', 'job_seeker') NOT NULL DEFAULT 'job_seeker',
    is_verified BOOLEAN DEFAULT FALSE,
    auth_status ENUM('pending_verification', 'active') NOT NULL DEFAULT 'pending_verification',
    is_active BOOLEAN DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_picture_url VARCHAR(255),
    avatar_url VARCHAR(255) NULL,
    google_id VARCHAR(255) NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'email',
    last_active_page VARCHAR(100) DEFAULT '/dashboard',
    last_state_payload JSON NULL,
    bio TEXT,
    preferred_language VARCHAR(20) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Job Seeker Profiles
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    headline VARCHAR(150),
    job_category VARCHAR(80),
    experience_level VARCHAR(30),
    education_level VARCHAR(80),
    bio TEXT,
    location VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    education JSON,
    graduation_year VARCHAR(10),
    skills JSON,
    languages JSON,
    job_preferences JSON,
    job_type VARCHAR(40),
    expected_salary INT,
    work_setup VARCHAR(30),
    raw_cv_text LONGTEXT,
    parsed_json_payload JSON,
    preferred_job_type ENUM('full-time', 'part-time', 'freelance', 'contractual', 'contract', 'volunteer', 'intern (paid)', 'intern (unpaid)', 'internship') DEFAULT 'full-time',
    preferred_work_mode ENUM('on-site', 'remote', 'hybrid', 'any') DEFAULT 'hybrid',
    salary_expectation_min INT,
    salary_expectation_max INT,
    currency VARCHAR(5) DEFAULT 'USD',
    is_available BOOLEAN DEFAULT TRUE,
    profile_completion_percentage INT DEFAULT 0,
    profile_completed BOOLEAN DEFAULT FALSE,
    is_open_to_opportunities BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_location (location),
    INDEX idx_availability (is_available)
);

-- ============================================================================
-- CV MANAGEMENT & AI ANALYSIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cvs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_size INT,
    mime_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parsed_text LONGTEXT,
    ai_analysis_score DECIMAL(5, 2),
    ai_extracted_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_primary (is_primary)
);

-- CV Analysis Results
CREATE TABLE IF NOT EXISTS cv_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    extracted_skills JSON,
    extracted_experience JSON,
    extracted_education JSON,
    extracted_languages JSON,
    extracted_certifications JSON,
    cv_score DECIMAL(5, 2),
    readability_score DECIMAL(5, 2),
    keyword_match_score DECIMAL(5, 2),
    recommendations JSON,
    analysis_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    analyzed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cv_analysis (cv_id)
);

-- ============================================================================
-- EMPLOYER & COMPANY MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    representative_name VARCHAR(100) DEFAULT NULL,
    representative_title VARCHAR(150),
    employer_type VARCHAR(50) NOT NULL DEFAULT 'company',
    work_email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    tin_number VARCHAR(50),
    trade_license_number VARCHAR(100) DEFAULT NULL,
    trade_license_url VARCHAR(255) DEFAULT NULL,
    company_registration_number VARCHAR(100) UNIQUE DEFAULT NULL,
    industry VARCHAR(100) DEFAULT NULL,
    company_size VARCHAR(50) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    logo_url VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    company_summary TEXT,
    location VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    state_province VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    employee_count INT,
    founded_year YEAR,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_at TIMESTAMP NULL DEFAULT NULL,
    social_media_urls JSON,
    hiring_volume VARCHAR(50),
    linkedin VARCHAR(255),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_verified (is_verified)
);

CREATE TABLE IF NOT EXISTS employers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employer_type VARCHAR(50) DEFAULT 'company',
    full_name VARCHAR(255) DEFAULT NULL,
    job_title VARCHAR(150) DEFAULT NULL,
    phone_number VARCHAR(50) DEFAULT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    tin_number VARCHAR(50) DEFAULT NULL,
    trade_license_document VARCHAR(255) DEFAULT NULL,
    headquarters_location VARCHAR(255) DEFAULT NULL,
    social_media TEXT DEFAULT NULL,
    about_company TEXT DEFAULT NULL,
    logo_url VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    mission TEXT DEFAULT NULL,
    vision TEXT DEFAULT NULL,
    services TEXT DEFAULT NULL,
    culture TEXT DEFAULT NULL,
    benefits TEXT DEFAULT NULL,
    founded_year INT DEFAULT NULL,
    userId INT NULL UNIQUE,
    companyName VARCHAR(150) DEFAULT NULL,
    company_size VARCHAR(50) DEFAULT NULL,
    legalBusinessName VARCHAR(150),
    representative_name VARCHAR(255),
    representative_title VARCHAR(150) DEFAULT NULL,
    tinNumber VARCHAR(50),
    licenseDocumentUrl VARCHAR(255),
    logoUrl VARCHAR(255),
    website VARCHAR(255),
    industry VARCHAR(100),
    companySize VARCHAR(50) DEFAULT '11-50',
    location VARCHAR(150),
    phoneNumber VARCHAR(20),
    phoneOperator VARCHAR(30),
    work_email VARCHAR(255),
    employer_type VARCHAR(50) NOT NULL DEFAULT 'company',
    verificationStatus ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_status VARCHAR(50) DEFAULT 'Pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employer_user (userId),
    INDEX idx_employer_verification (verificationStatus)
);

CREATE TABLE IF NOT EXISTS household_employers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employer_type VARCHAR(50) DEFAULT 'individual',
    full_name VARCHAR(255) NOT NULL,
    role_relationship VARCHAR(150) DEFAULT NULL,
    work_email VARCHAR(255) DEFAULT NULL,
    phone_number VARCHAR(50) NOT NULL,
    household_name VARCHAR(255) NOT NULL,
    industry VARCHAR(150) DEFAULT 'Domestic & Home Services',
    household_members VARCHAR(50) DEFAULT '1-2 People',
    residence_location VARCHAR(255) NOT NULL,
    about_household TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS talent_pool (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employerId INT NOT NULL,
    candidateId INT NOT NULL,
    candidateName VARCHAR(150) NOT NULL,
    primaryRole VARCHAR(150),
    skills JSON,
    aiMatchScore DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    savedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved_candidate (employerId, candidateId),
    INDEX idx_talent_pool_employer (employerId)
);

CREATE TABLE IF NOT EXISTS job_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employerId INT NOT NULL,
    candidateId INT NOT NULL,
    jobId INT NOT NULL,
    message TEXT,
    status ENUM('invited', 'accepted', 'declined', 'expired') DEFAULT 'invited',
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_invitation (employerId, candidateId, jobId),
    INDEX idx_invitation_status (status),
    INDEX idx_invitation_candidate (candidateId)
);

CREATE TABLE IF NOT EXISTS employer_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    emailAlerts BOOLEAN DEFAULT TRUE,
    matchingAlerts BOOLEAN DEFAULT TRUE,
    weeklyDigest BOOLEAN DEFAULT FALSE,
    notificationEmail VARCHAR(150),
    teamPermissions JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employer_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employerId INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    related_job_id INT NULL,
    related_application_id INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employer_notification_read (employerId, isRead)
);

CREATE TABLE IF NOT EXISTS employer_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employerId INT NOT NULL,
    candidateId INT NOT NULL,
    subject VARCHAR(200),
    body TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employer_message_participants (employerId, candidateId, isRead)
);

CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicationId INT NOT NULL UNIQUE,
    employerId INT NOT NULL,
    candidateId INT NOT NULL,
    offeredSalary DECIMAL(12,2),
    startDate DATE,
    offerLetterUrl VARCHAR(255),
    status ENUM('draft', 'sent', 'accepted', 'declined') DEFAULT 'draft',
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_offers_employer (employerId)
);

CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidateId INT NOT NULL,
    employerId INT NOT NULL,
    taskTitle VARCHAR(200) NOT NULL,
    isCompleted BOOLEAN DEFAULT FALSE,
    documentUrl VARCHAR(255),
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_candidate_task (candidateId, taskTitle),
    INDEX idx_onboarding_employer (employerId, isCompleted)
);

-- Company Verification Requests
CREATE TABLE IF NOT EXISTS company_verification_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    verification_document_url VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    reviewed_by INT,
    rejection_reason TEXT,
    FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_status (status)
);

-- ============================================================================
-- JOB MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    description LONGTEXT NOT NULL,
    category VARCHAR(100),
    job_type ENUM('full-time', 'part-time', 'contract', 'temporary', 'internship', 'freelance', 'self-employed') NOT NULL,
    experience_level ENUM('entry-level', 'mid-level', 'senior-level', 'executive') DEFAULT 'mid-level',
    location VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    state_province VARCHAR(100),
    work_mode ENUM('on-site', 'remote', 'hybrid') DEFAULT 'hybrid',
    gender_preference ENUM('any', 'male', 'female') DEFAULT 'any',
    salary_min INT,
    salary_max INT,
    currency VARCHAR(5) DEFAULT 'USD',
    salary_period ENUM('hourly', 'monthly', 'yearly') DEFAULT 'yearly',
    is_salary_negotiable BOOLEAN DEFAULT TRUE,
    benefits TEXT,
    required_education ENUM('high-school', 'associate', 'bachelor', 'master', 'phd', 'any') DEFAULT 'bachelor',
    years_of_experience_min INT DEFAULT 0,
    years_of_experience_max INT DEFAULT 20,
    application_deadline DATE,
    scheduled_date DATETIME NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'active', 'published', 'scheduled', 'rejected', 'closed', 'filled', 'archived') DEFAULT 'draft',
    rejection_reason TEXT,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until DATETIME,
    view_count INT DEFAULT 0,
    application_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL DEFAULT NULL,
    closed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_country_city (country, city),
    INDEX idx_salary (salary_min, salary_max),
    FULLTEXT INDEX ft_title_desc (title, description)
);

-- Job Required Skills
CREATE TABLE IF NOT EXISTS job_required_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    is_must_have BOOLEAN DEFAULT FALSE,
    skill_weight INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_skill (job_id, skill_name)
);

-- Job Required Languages
CREATE TABLE IF NOT EXISTS job_required_languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    language_name VARCHAR(50) NOT NULL,
    proficiency ENUM('elementary', 'limited-working', 'professional-working', 'full-professional', 'native') NOT NULL,
    is_must_have BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_language (job_id, language_name)
);

-- ============================================================================
-- APPLICATIONS & MATCHING
-- ============================================================================

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    job_seeker_id INT NOT NULL,
    cv_id INT,
    resume_snapshot JSON NULL,
    status ENUM('applied', 'under-review', 'shortlisted', 'rejected', 'interview-scheduled', 'offered', 'hired', 'withdrawn') DEFAULT 'applied',
    application_status_flow JSON,
    ai_match_score DECIMAL(5, 2),
    skills_match_score DECIMAL(5, 2),
    experience_match_score DECIMAL(5, 2),
    education_match_score DECIMAL(5, 2),
    location_match_score DECIMAL(5, 2),
    salary_match_score DECIMAL(5, 2),
    work_mode_match_score DECIMAL(5, 2),
    language_match_score DECIMAL(5, 2),
    job_type_match_score DECIMAL(5, 2),
    employer_notes TEXT,
    seeker_cover_letter TEXT,
    ai_recommendation TEXT,
    rank_position INT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cv_id) REFERENCES cvs(id),
    INDEX idx_job_id (job_id),
    INDEX idx_seeker_id (job_seeker_id),
    INDEX idx_status (status),
    INDEX idx_ai_score (ai_match_score)
    ,UNIQUE KEY unique_application_candidate_job (job_id, job_seeker_id)
);

-- Skill Gaps
CREATE TABLE IF NOT EXISTS skill_gaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    missing_skill VARCHAR(100) NOT NULL,
    skill_importance ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
    recommended_learning_resources JSON,
    estimated_learning_time_hours INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_app_id (application_id)
);

-- Saved/Bookmarked Jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_job (user_id, job_id),
    INDEX idx_user_id (user_id)
);

-- ============================================================================
-- INTERVIEW MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL UNIQUE,
    interview_type ENUM('phone', 'video', 'in-person', 'coding-test') DEFAULT 'video',
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    interview_url VARCHAR(255),
    interview_status ENUM('scheduled', 'in-progress', 'completed', 'rescheduled', 'cancelled') DEFAULT 'scheduled',
    interviewer_id INT,
    notes TEXT,
    interviewer_feedback TEXT,
    interview_score DECIMAL(5, 2),
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (interviewer_id) REFERENCES users(id),
    INDEX idx_status (interview_status)
);

-- Interview Questions
CREATE TABLE IF NOT EXISTS interview_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('open-ended', 'technical', 'behavioral', 'coding') DEFAULT 'open-ended',
    ai_prepared BOOLEAN DEFAULT FALSE,
    question_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- Interview Answers & AI Evaluation
CREATE TABLE IF NOT EXISTS interview_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_question_id INT NOT NULL,
    answer_text TEXT,
    answer_video_url VARCHAR(255),
    ai_evaluation_score DECIMAL(5, 2),
    ai_feedback TEXT,
    interviewer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_question_id) REFERENCES interview_questions(id) ON DELETE CASCADE
);

-- ============================================================================
-- MESSAGING & COMMUNICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    employer_id INT NOT NULL,
    job_seeker_id INT NOT NULL,
    subject VARCHAR(255),
    status ENUM('active', 'archived', 'closed') DEFAULT 'active',
    last_message_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_participants (employer_id, job_seeker_id),
    INDEX idx_status (status)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    attachment_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_is_read (is_read)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('job-match', 'application-status', 'shortlisted', 'interview-scheduled', 'new-message', 'ai-recommendation', 'job-alert', 'company-update') DEFAULT 'job-match',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_job_id INT,
    related_application_id INT,
    related_user_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL DEFAULT NULL,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    FOREIGN KEY (related_application_id) REFERENCES applications(id) ON DELETE SET NULL,
    FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_type (type)
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_job_matches BOOLEAN DEFAULT TRUE,
    email_application_updates BOOLEAN DEFAULT TRUE,
    email_messages BOOLEAN DEFAULT TRUE,
    email_interviews BOOLEAN DEFAULT TRUE,
    email_ai_recommendations BOOLEAN DEFAULT TRUE,
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    daily_digest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- ADMIN & SYSTEM MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_actions_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type ENUM('user-blocked', 'user-unblocked', 'job-removed', 'company-verified', 'company-rejected', 'report-reviewed', 'content-moderated') NOT NULL,
    target_user_id INT,
    target_job_id INT,
    target_company_id INT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (target_job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_user_id INT,
    reported_job_id INT,
    report_type ENUM('inappropriate-content', 'spam', 'fraud', 'offensive-language', 'other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'under-review', 'resolved', 'dismissed') DEFAULT 'pending',
    resolution_notes TEXT,
    resolved_by INT,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- Blocked Users
CREATE TABLE IF NOT EXISTS blocked_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blocked_by_id INT NOT NULL,
    blocked_user_id INT NOT NULL,
    reason TEXT,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unblocked_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (blocked_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_block (blocked_by_id, blocked_user_id),
    INDEX idx_blocked_user_id (blocked_user_id)
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- ACTIVITY & ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('login', 'profile-update', 'job-view', 'job-apply', 'profile-view', 'message-sent', 'cv-upload', 'role_selected') NOT NULL,
    related_job_id INT,
    related_user_id INT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Job Analytics
CREATE TABLE IF NOT EXISTS job_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL UNIQUE,
    total_views INT DEFAULT 0,
    total_applications INT DEFAULT 0,
    total_shortlisted INT DEFAULT 0,
    total_interviews INT DEFAULT 0,
    average_match_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

COMMIT;