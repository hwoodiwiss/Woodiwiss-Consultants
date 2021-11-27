<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/includes.php';
require_once __DIR__ . '/../AppConfig.php';
require_once __DIR__ . '/../Db/includes.php';
require_once __DIR__ . '/../lib/includes.php';


class SessionAuthorisationService implements AuthorisationService
{
	private string $AuthKey = 'Auth';
	private string $UserKey = 'User';

	public function __construct(private UsersContext $usersTable, private Session $session)
	{
	}

	public function Authorise(string $identifier, string $identifierField, string $password): bool
	{
		$userResult = $this->usersTable->Select([], [new DbCondition($identifierField, $identifier)]);

		if (count($userResult) !== 1)
			return false;

		/** @var User */$user = $userResult[0];


		if (!password_verify($password, $user->PassHash)) {
			return false;
		}

		//Update the users password to ensure they are always using the current secure default algo for the PHP runtime
		$updatedPassword = password_hash($password, PASSWORD_DEFAULT, ['cost' => 13]);
		$user->PassHash = $updatedPassword;
		$this->usersTable->UpdateObj($user);

		$this->session[$this->AuthKey] = true;
		$this->session[$this->UserKey] = $user->Id;

		return true;
	}

	public function Deauthorise()
	{
		$this->session[$this->AuthKey] = false;
		unset($this->session[$this->UserKey]);
	}

	public function IsAuthorised(): bool
	{
		if (!isset($this->session[$this->AuthKey]) || $this->session[$this->AuthKey] !== true || !isset($this->session[$this->UserKey]))
			return false;

		$sessUserId = $this->session[$this->UserKey];

		$dbUser = $this->usersTable->Select([], [new DbCondition('Id', $sessUserId), new DbCondition('Active', 1)])[0];
		if ($dbUser === null)
			return false;

		return true;
	}

	public function GetAuthorisedUser(): ?User
	{
		if (!isset($this->session[$this->AuthKey]) || $this->session[$this->AuthKey] !== true || !isset($this->session[$this->UserKey]))
			return null;

		$sessUserId = $this->session[$this->UserKey];

		/** @var ?User */$dbUser = $this->usersTable->Find((string)$sessUserId);
		if ($dbUser === null)
			return null;

		return $dbUser;
	}

}