<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../AppConfig.php';
require_once __DIR__ . '/../lib/includes.php';


class UserManagementService
{

	public function __construct(private UsersContext $users)
	{
	}

	public function Exists(string $checkVal, string $checkField): User|null
	{
		$users = $this->users->Select([$checkField], [new DbCondition($checkField, $checkVal)]);
		return count($users) === 1 ? $users[0] : null;
	}

	public function AddUser(NewUserFormModel $newUser): User|null
	{
		$newUserArr = [
			"Email" => $newUser->email,
			"FirstName" => $newUser->firstName,
			"LastName" => $newUser->lastName,
			"PassHash" => $this->GeneratePasswordHash($newUser->password)
		];

		$createdId = null;
		try {
			$createdId = $this->users->Insert($newUserArr);
		}
		catch (\Exception $e) {
			return null;
		}

		return $this->users->Find($createdId);
	}

	public function UpdateUser(UpdateUserFormModel $updateUser): User|null
	{
		/** @var User|null*/$user = $this->users->Find($updateUser->id);
		if ($user === null)
			return null;

		$user->FirstName = $updateUser->firstName;
		$user->LastName = $updateUser->lastName;
		$user->Email = $updateUser->email;

		if ($updateUser->password !== null) {
			$user->PassHash = $this->GeneratePasswordHash($updateUser->password);
		}

		try {
			$this->users->UpdateObj($user);
		}
		catch (\Exception $e) {
			return null;
		}

		return $this->users->Find($user->Id);
	}

	public function ListUsers(): array
	{
		return $this->users->Select([], [new DbCondition('Active', 1)]);
	}

	public function DeleteUser(int $id): void
	{
		$this->users->Update(['Active' => 0], [new DbCondition('Id', $id)]);
	}

	private function GeneratePasswordHash(string $password): string
	{
		return password_hash($password, PASSWORD_DEFAULT, ['cost' => 13]);
	}
}