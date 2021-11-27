<?php

require_once __DIR__ . '/../../src/Controllers/OptionsController.php';

use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\OptionsController;
use WoodiwissConsultants\ControllerContext;
use WoodiwissConsultants\OkResult;

class OptionsControllerTest extends TestCase
{
	private ControllerContext $ctx;
	private OptionsController $controller;

	protected function setUp(): void
	{
		$this->ctx = new ControllerContext();
		$this->controller = new OptionsController($this->ctx);
	}

	public function testOptionsController_CtorCanConstructWithContext()
	{
		$ctx = new ControllerContext();
		$this->assertInstanceOf(OptionsController::class , new OptionsController($ctx));
	}

	public function testOptionsController_SetCorsAllowedHeadersSetsAccessControlHeadersArray()
	{
		$requestHeaders = ['content-type', 'origin'];
		$this->ctx->requestHeaders['Access-Control-Request-Headers'] = $requestHeaders;

		$this->controller->HandleOptions();

		$actualHeaders = $this->ctx->responseHeaders['Access-Control-Allow-Headers'];

		$this->assertTrue(is_array($actualHeaders));
		$this->assertCount(4, $actualHeaders);
		foreach ($requestHeaders as $header) {
			$this->assertContains($header, $actualHeaders);
		}
		$this->assertContains('Access-Control-Allow-Origin', $actualHeaders);
		$this->assertContains('Access-Control-Allow-Credentials', $actualHeaders);

	}

	public function testOptionsController_SetCorsAllowedHeadersSetsAccessControlHeadersString()
	{
		$requestHeaders = 'content-type, origin';
		$this->ctx->requestHeaders['Access-Control-Request-Headers'] = $requestHeaders;

		$this->controller->HandleOptions();

		$actualHeaders = $this->ctx->responseHeaders['Access-Control-Allow-Headers'];


		$this->assertFalse(is_array($actualHeaders));
		$this->assertStringContainsString($requestHeaders, $actualHeaders);
		$this->assertStringContainsString('Access-Control-Allow-Origin', $actualHeaders);

	}

}