<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/lib/includes.php';

class AppConfig
{
	public DatabaseAppConfig $database;
	public RecaptchaAppConfig $recaptcha;
	public CorsAppConfig $cors;
	public OwnerAppConfig $owner;
	public SecurityAppConfig $security;

	public static function from(string $iniFile): AppConfig
	{
		$mapper = new Mapper(AppConfig::class);
		$configArray = parse_ini_file($iniFile, true);

		$config = $mapper->map($configArray);

		return $config;
	}
}

class DatabaseAppConfig
{
	public string $driver;
	public string $host;
	public string|null $port;
	public string $database;
	public string $username;
	public string $password;
}

class RecaptchaAppConfig
{
	public string $verifyuri;
	public string $privatekey;
	public float $threshold;
}

class CorsAppConfig
{
	public string $allowedorigins;
}

class OwnerAppConfig
{
	public string $name;
	public string $email;
}

class SecurityAppConfig
{
	public string $jwtsecret;
}