const db = require('../connection');

const normalizeGoogleProfile = (profile = {}) => {
  const email = String(profile?.emails?.[0]?.value || profile?.email || '').trim().toLowerCase();
  const googleId = String(profile?.id || profile?.sub || '').trim();
  const fullName = String(profile?.displayName || profile?.name || 'Google User').trim() || 'Google User';
  const avatarUrl = profile?.photos?.[0]?.value || profile?.picture || null;

  return {
    email,
    googleId,
    fullName,
    avatarUrl,
  };
};

const sanitizeGoogleUser = (user = {}) => ({
  id: user.id,
  full_name: user.full_name || user.name || 'Google User',
  email: user.email,
  phone: user.phone || null,
  role: user.role || 'job_seeker',
  is_verified: Boolean(user.is_verified),
  is_active: user.is_active !== false,
  google_id: user.google_id || null,
  auth_provider: user.auth_provider || 'google',
  avatar_url: user.avatar_url || user.profile_picture_url || null,
  profile_picture_url: user.avatar_url || user.profile_picture_url || null,
  googleNewUser: Boolean(user.googleNewUser),
});

async function syncGoogleUser({ dbClient = db, profile, authProvider = 'google' }) {
  const normalized = normalizeGoogleProfile(profile);
  const { email, googleId, fullName, avatarUrl } = normalized;

  if (!email || !googleId) {
    throw new Error('Google profile is incomplete. Missing email or Google user id.');
  }

  const [existingRows] = await dbClient.query(
    'SELECT * FROM users WHERE google_id = ? OR email = ? ORDER BY id ASC LIMIT 1',
    [googleId, email]
  );

  let existingUser = existingRows && existingRows[0] ? existingRows[0] : null;

  if (existingUser) {
    const linkNeeded = !existingUser.google_id || existingUser.google_id !== googleId;

    if (linkNeeded) {
      await dbClient.query(
        `UPDATE users
         SET google_id = ?, is_verified = TRUE, auth_provider = COALESCE(auth_provider, ?), avatar_url = COALESCE(avatar_url, ?), profile_picture_url = COALESCE(profile_picture_url, ?)
         WHERE id = ?`,
        [googleId, authProvider, avatarUrl, avatarUrl, existingUser.id]
      );
    } else {
      await dbClient.query(
        `UPDATE users
         SET is_verified = TRUE, auth_provider = COALESCE(auth_provider, ?), avatar_url = COALESCE(avatar_url, ?), profile_picture_url = COALESCE(profile_picture_url, ?)
         WHERE id = ?`,
        [authProvider, avatarUrl, avatarUrl, existingUser.id]
      );
    }

    const [freshRows] = await dbClient.query('SELECT * FROM users WHERE id = ?', [existingUser.id]);
    existingUser = freshRows && freshRows[0] ? freshRows[0] : existingUser;
    return {
      user: sanitizeGoogleUser(existingUser),
      isNewUser: false,
    };
  }

  const [insertResult] = await dbClient.query(
    `INSERT INTO users (
      full_name,
      email,
      password,
      google_id,
      role,
      is_verified,
      is_active,
      avatar_url,
      profile_picture_url,
      auth_provider
    ) VALUES (?, ?, NULL, ?, ?, TRUE, TRUE, ?, ?, ?)`,
    [fullName, email, googleId, 'job_seeker', avatarUrl, avatarUrl, authProvider]
  );

  const targetId = insertResult && insertResult.insertId ? insertResult.insertId : null;

  const [newRows] = await dbClient.query('SELECT * FROM users WHERE id = ?', [targetId]);
  const newUser = (newRows && newRows[0]) || {
    id: targetId,
    full_name: fullName,
    email,
    google_id: googleId,
    role: 'job_seeker',
    is_verified: true,
    is_active: true,
    auth_provider: authProvider,
    avatar_url: avatarUrl,
    profile_picture_url: avatarUrl,
  };

  return {
    user: sanitizeGoogleUser({ ...newUser, googleNewUser: true }),
    isNewUser: true,
  };
}

module.exports = {
  normalizeGoogleProfile,
  sanitizeGoogleUser,
  syncGoogleUser,
};
