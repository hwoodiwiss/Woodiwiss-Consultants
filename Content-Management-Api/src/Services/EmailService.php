<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../AppConfig.php';
require_once __DIR__ . '/../lib/includes.php';

class EmailService
{
	public function __construct()
	{
	}

	public function Send(string $to, string $subject, string $message): bool
	{
		return mail($to, $subject, $message);
	}
}