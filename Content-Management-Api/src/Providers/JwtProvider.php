<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../AppConfig.php';
require_once __DIR__ . '/includes.php';

class JwtProvider
{
	public function __construct(private AppConfig $config, private DateTimeProvider $dateTime)
	{
	}

	public function create(User $user): string
	{
		$header = json_encode(['typ' => 'JWT', 'alg' => 'HS512']);
		$payload = json_encode(['sub' => $user->Id,
			'iss' => 'woodiwiss_auth',
			'iat' => $this->dateTime->UTCNow()->getTimestamp(),
			'exp' => $this->dateTime->UTCNow()->add((new \DateInterval('P10M')))->getTimestamp()
		]);


		$base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
		$base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

		$signature = hash_hmac('sha512', $base64UrlHeader . "." . $base64UrlPayload, $this->config->security->jwtsecret, true);

		$base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

		return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

	}

	public function validate(string $jwt): ?JWT
	{
		[$headerB64Url, $bodyB64Url, $sigB64Url] = @explode('.', $jwt);
		if (!isset($headerB64Url) || !isset($bodyB64Url) || !isset($sigB64Url))
			return null;

		$validationSignature = hash_hmac('sha512', $headerB64Url . "." . $bodyB64Url, $this->config->security->jwtsecret, true);
		$valSigB64Url = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validationSignature));
		if ($sigB64Url !== $valSigB64Url)
			return null;

		$bodyString = base64_decode(str_replace(['-', '_'], ['+', '/'], $bodyB64Url));
		$body = json_decode($bodyString, true);
		if (!isset($body['exp']))
			return null;

		$expiry = (new \DateTime())->setTimestamp($body['exp']);
		if ($expiry < $this->dateTime->UTCNow())
			return null;

		$headerString = base64_decode(str_replace(['-', '_'], ['+', '/'], $headerB64Url));
		$header = json_decode($headerString, true);

		$jwtData = ["header" => $header, "body" => $body];
		$jwtMapper = new Mapper(JWT::class);

		return $jwtMapper->map($jwtData);
	}
}

class JwtHeader
{
	public string $typ;
	public string $alg;
}

class JwtBody
{
	public string $sub;
	public string $iss;
	public string $iat;
	public string $exp;
}

class JWT
{
	public JwtHeader $header;
	public JwtBody $body;
}