<?php

require_once __DIR__ . '/../../src/Controllers/HomeController.php';

use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\HomeController;
use WoodiwissConsultants\ControllerContext;
use WoodiwissConsultants\OkResult;

class HomeControllerTest extends TestCase
{
	private ControllerContext $ctx;
	private HomeController $controller;

	protected function setUp(): void
	{
		$this->ctx = new ControllerContext();
		$this->controller = new HomeController($this->ctx);
	}

	public function testHomeController_CtorCanConstructWithContext()
	{
		$ctx = new ControllerContext();
		$this->assertInstanceOf(HomeController::class , new HomeController($ctx));
	}

	public function testHomeController_EchoReturnsOkResult()
	{
		$result = $this->controller->Echo();
		$this->assertEquals(OkResult::class , $result::class);
	}

}