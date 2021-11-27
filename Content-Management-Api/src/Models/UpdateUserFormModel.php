<?php

namespace WoodiwissConsultants;

class UpdateUserFormModel
{
	public int $id;
	public string $email;
	public string $firstName;
	public string $lastName;
	public ?string $password;
	public string $recaptchaToken;
}