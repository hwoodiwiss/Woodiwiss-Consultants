<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../AppConfig.php';
require_once __DIR__ . '/../lib/includes.php';


class RecaptchaService
{
	private string $verifyUri;
	private string $privateKey;

	public function __construct(AppConfig $config)
	{
		$this->verifyUri = $config->recaptcha->verifyuri;
		$this->privateKey = $config->recaptcha->privatekey;
	}

	public function ValidateRequest(string $token, ?string $remoteIp = null): bool
	{
		$requestMapper = new Mapper(RecaptchaRequest::class);
		$responseMapper = new Mapper(RecaptchaResponse::class);

		$requestInfo = [
			'secret' => $this->privateKey,
			'response' => $token,
			'remoteip' => $remoteIp,
		];
		$request = $requestMapper->map($requestInfo);

		$options = [
			'http' => [
				'header' => 'Content-type: application/x-www-form-urlencoded\r\n',
				'method' => 'POST',
				'content' => http_build_query($request)
			]
		];

		$context = stream_context_create($options);

		$response = new RecaptchaResponse();
		$result = file_get_contents($this->verifyUri, false, $context);
		if (!$result) {
			return false;
		}

		$resultData = json_decode($result, true);
		/** @var RecaptchaResponse */$response = $responseMapper->map($resultData);

		//Manually map error codes because php doesn't support hyphens in property names
		$response->errorCodes = isset($resultData['error-codes']) ? $resultData['error-codes'] : null;

		return $response->success || $response->score == null || $response->score < $this->config->recaptcha->threshold;
	}

}

class RecaptchaRequest
{
	public string $secret;
	public string $response;
	public ?string $remoteip;
}

class RecaptchaResponse
{
	public bool $success;
	public ?string $challenge_ts;
	public ?string $hostname;
	public ?float $score;
	public ?string $action;
	public ?array $errorCodes;
}