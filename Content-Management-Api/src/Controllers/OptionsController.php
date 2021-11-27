<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';

class OptionsController extends ControllerBase
{
	#[HttpMethods(['OPTIONS'])]
	public function HandleOptions(): IResult
	{
		$requestedHeaders = $this->ctx->requestHeaders['Access-Control-Request-Headers'] ?? [];
		if (is_array($requestedHeaders)) {
			$this->ctx->responseHeaders['Access-Control-Allow-Headers'] = [...$requestedHeaders, 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'];
		}
		else {
			$this->ctx->responseHeaders['Access-Control-Allow-Headers'] = $requestedHeaders . ', Access-Control-Allow-Origin, Access-Control-Allow-Credentials';
		}
		return $this->Ok();
	}
}
