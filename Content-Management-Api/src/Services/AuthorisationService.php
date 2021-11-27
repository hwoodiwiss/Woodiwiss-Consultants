<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../Db/includes.php';


interface AuthorisationService
{

	public function Authorise(string $identifier, string $identifierField, string $password): bool;

	public function Deauthorise();

	public function IsAuthorised(): bool;

	public function GetAuthorisedUser(): ?User;

}