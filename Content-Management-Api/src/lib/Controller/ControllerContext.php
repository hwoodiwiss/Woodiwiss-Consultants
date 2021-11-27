<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/HeaderCollection.php';
require_once __DIR__ . '/Session.php';
require_once __DIR__ . '/../../AppConfig.php';

class ControllerContextBuilder
{
	private ControllerContext $context;

	public function __construct()
	{
		$this->context = new ControllerContext();
	}

	public function AddRequestHeaders(array $headers): ControllerContextBuilder
	{
		foreach ($headers as $name => $value) {
			$exploded = explode(", ", $value);
			$this->context->requestHeaders[$name] = count($exploded) > 1 ? $exploded : $value;
		}
		return $this;
	}

	public function AddRequestMethod(string $method): ControllerContextBuilder
	{
		$this->context->RequestMethod = $method;
		return $this;
	}

	public function AddRequestBody(string $content): ControllerContextBuilder
	{
		$contents = $content;
		$this->context->RequestBody = $contents !== false ? $contents : '';
		return $this;
	}

	public function AddQuery(?string $queryString): ControllerContextBuilder
	{
		parse_str($queryString, $this->context->QueryParams);
		return $this;
	}

	public function AddCorsHeaders(string $AllowedOrigins): ControllerContextBuilder
	{
		if ($AllowedOrigins !== '*') {
			if (isset($this->context->requestHeaders['Origin']) && str_contains(strtolower($AllowedOrigins), strtolower($this->context->requestHeaders['Origin']))) {
				$this->context->responseHeaders['Access-Control-Allow-Origin'] = $this->context->requestHeaders['Origin'];
			}
		}
		else {
			$this->context->responseHeaders['Access-Control-Allow-Origin'] = '*';
		}

		$this->context->responseHeaders['Access-Control-Allow-Headers'] = ['Access-Control-Allow-Origin'];

		return $this;
	}

	public function AddAllowCredentials(): ControllerContextBuilder
	{
		$this->context->responseHeaders['Access-Control-Allow-Credentials'] = 'true';
		return $this;
	}

	public function Build(): ControllerContext
	{
		return $this->context;
	}

}

class ControllerContext
{
	public HeaderCollection $requestHeaders;
	public HeaderCollection $responseHeaders;
	public string $RequestMethod;
	public string $RequestBody;
	public array $QueryParams;

	public function __construct()
	{
		$this->QueryParams = [];
		$this->responseHeaders = new HeaderCollection();
		$this->requestHeaders = new HeaderCollection();
	}

	function IsAjax(): bool
	{
		return (!empty($this->requestHeaders['HTTP_X_REQUESTED_WITH']) && strtolower($this->requestHeaders['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest');
	}
}
