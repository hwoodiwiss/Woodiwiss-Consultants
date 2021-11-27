<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';

class User extends DbData
{
	public int $Id;
	public string $Email;
	public string $FirstName;
	public string $LastName;
	public string $PassHash;
}