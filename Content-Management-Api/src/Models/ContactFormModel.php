<?php

namespace WoodiwissConsultants;

class ContactFormModel
{
	public string $name;
	public ?string $organisation;
	public string $email;
	public string $message;
	public string $recaptchaToken;
}