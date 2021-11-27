<?php

require_once __DIR__ . '/../../../src/lib/Controller/ControllerBase.php';

use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\ControllerBase;
use WoodiwissConsultants\ControllerContext;
use PHPUnit\Framework\Assert;


class ControllerBaseTest extends TestCase
{
	private ControllerContext $ctx;
	private TestingController $controller;
	public string $testMapperObjectWithIncorrectJson;
	public string $testMapperObjectJson;

	protected function setUp(): void
	{
		$this->ctx = new ControllerContext();
		$this->controller = new TestingController($this->ctx);
		$this->testMapperObjectWithIncorrectJson = file_get_contents(__DIR__ . '/../../TestData/TestMapperObjectWithIncorrect.json');
		$this->testMapperObjectJson = file_get_contents(__DIR__ . '/../../TestData/TestMapperObject.json');


	}

	public function testControllerBase_CtorCanConstruct()
	{
		$ctx = new ControllerContext();
		$this->assertInstanceOf(TestingController::class , new TestingController($this->ctx));
	}

	public function testControllerBase_SerializeBodyReturnsFalseForEmptyBody()
	{
		$this->ctx->RequestBody = '';
		$result = $this->controller->SerializeBodyPublic(TestMapperObject::class);

		$this->assertFalse($result);
	}

	public function testControllerBase_SerializeBodyReturnsFalseForInvalidBody()
	{
		$this->ctx->RequestBody = $this->testMapperObjectWithIncorrectJson;
		$result = $this->controller->SerializeBodyPublic(TestMapperObject::class);

		$this->assertFalse($result);
	}

	public function testControllerBase_SerializeBodyReturnsObjectWhenValid()
	{
		$this->ctx->RequestBody = $this->testMapperObjectJson;
		$result = $this->controller->SerializeBodyPublic(TestMapperObject::class);

		$this->assertInstanceOf(TestMapperObject::class , $result);
	}

}


class TestingController extends ControllerBase

{
	public function __construct(ControllerContext $ctx)
	{
		parent::__construct($ctx);
	}

	public function SerializeBodyPublic(string $type)
	{
		return $this->SerializeBody($type);
	}

}