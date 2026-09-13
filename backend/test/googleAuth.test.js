const assert = require('node:assert/strict');
const { syncGoogleUser } = require('../config/googleAuth');

(async () => {
  let createdUser = null;
  const dbClient = {
    query: async (sql, params) => {
      if (sql.includes('SELECT * FROM users WHERE google_id = ? OR email = ?')) {
        return [createdUser ? [createdUser] : []];
      }
      if (sql.includes('INSERT INTO users')) {
        createdUser = {
          id: 42,
          full_name: params[0],
          email: params[1],
          google_id: params[2],
          role: params[3],
          is_verified: true,
          is_active: true,
          auth_provider: params[4],
          avatar_url: params[5]
        };
        return [{ insertId: 42 }];
      }
      if (sql.includes('UPDATE users SET google_id')) {
        createdUser = { ...createdUser, google_id: params[0], is_verified: true, avatar_url: params[1] || createdUser.avatar_url };
        return [{}];
      }
      return [{}];
    }
  };

  const result = await syncGoogleUser({
    dbClient,
    profile: {
      id: 'google-123',
      emails: [{ value: 'hello@example.com' }],
      displayName: 'Hello User',
      photos: [{ value: 'https://avatar.example.com/hello.png' }],
    },
  });

  assert.equal(result.isNewUser, true);
  assert.equal(result.user.email, 'hello@example.com');
  assert.equal(result.user.auth_provider, 'google');
  console.log('googleAuth test passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
