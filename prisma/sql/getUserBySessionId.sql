-- @param {String} $1:sessionId
-- @param {DateTime} $2:expiresAt
SELECT
	users.user_id,
	users.account_id,
	users.display_name,
	users.created_at,
	users.updated_at
FROM
	users
	INNER JOIN sessions ON users.account_id = sessions.account_id
	AND sessions.session_id = $1
WHERE
  users.deleted_at IS NULL
  AND sessions.expires_at > $2
