<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/includes.php';
require_once __DIR__ . '/../AppConfig.php';
require_once __DIR__ . '/../Db/includes.php';
require_once __DIR__ . '/../lib/includes.php';


class JwtAuthorisationService implements AuthorisationService
{

	public function __construct(private UsersContext $usersTable, private ControllerContext $ctx)
	{
	}

	public function Authorise(string $identifier, string $identifierField, string $password): bool
	{
		$userResult = $this->usersTable->Select([], [new DbCondition($identifierField, $identifier)]);

		if (count($userResult) !== 1)
			return false;

		/** @var User */$user = $userResult[0];

		$inputHash = hash('sha512', $password . $user->PassSalt);

		if ($user->PassHash !== $inputHash)
			return false;



		return true;
	}

	public function Deauthorise()
	{
		$this->session[$this->AuthKey] = false;
		unset($this->session[$this->UserKey]);
	}

	public function IsAuthorised(): bool
	{

		return true;
	}

	public function GetAuthorisedUser(): ?User
	{

		return null;
	}

}