-- @param {String} $1:sessionId
SELECT
  accounts.account_id,
  accounts.email,
  accounts.last_login,
  accounts.created_at,
  accounts.updated_at,
  accounts.deleted_at
FROM
	accounts
	INNER JOIN sessions ON accounts.account_id = sessions.account_id
	AND sessions.session_id = $1
WHERE
  accounts.deleted_at IS NULL
