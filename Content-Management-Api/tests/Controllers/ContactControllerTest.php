<?php

require_once __DIR__ . '/../../src/Controllers/ContactController.php';

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;
use WoodiwissConsultants\ContactController;
use WoodiwissConsultants\ContactFormModel;
use WoodiwissConsultants\AppConfig;
use WoodiwissConsultants\RecaptchaService;
use WoodiwissConsultants\Mapper;
use WoodiwissConsultants\EmailService;
use WoodiwissConsultants\ControllerContext;
use WoodiwissConsultants\OkResult;
use WoodiwissConsultants\BadRequestResult;
use WoodiwissConsultants\CustomResult;
use WoodiwissConsultants\OwnerAppConfig;

class ContactControllerTest extends TestCase
{
	private ControllerContext $ctx;
	private ContactController $controller;
	private MockObject $mockRecaptchaService;
	private MockObject $mockEmailService;
	private AppConfig $appConfig;
	private ContactFormModel $testContactForm;

	protected function setUp(): void
	{
		$this->ctx = new ControllerContext();
		$this->appConfig = new AppConfig();

		$this->mockRecaptchaService = $this->createMock(RecaptchaService::class);
		$this->mockEmailService = $this->createMock(EmailService::class);
		$this->controller = new ContactController($this->appConfig, $this->mockRecaptchaService, $this->mockEmailService, $this->ctx);
		$this->testContactForm = (new Mapper(ContactFormModel::class))->map(json_decode(file_get_contents(__DIR__ . '/../TestData/TestContactForm.json')));

	}

	public function testContactController_CtorCanConstruct()
	{
		$ctx = new ControllerContext();
		$this->assertInstanceOf(ContactController::class , new ContactController($this->appConfig, $this->mockRecaptchaService, $this->mockEmailService, $this->ctx));
	}

	public function testContactController_SendPOSTReturns400IfRecaptchaFails()
	{
		$this->ctx->RequestMethod = 'POST';

		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(false);

		$result = $this->controller->Send($this->testContactForm);

		$this->assertInstanceOf(BadRequestResult::class , $result);

	}

	public function testContactController_SendPOSTReturns500IfSendingMailFails()
	{
		$this->ctx->RequestMethod = 'POST';

		$this->appConfig->owner = new OwnerAppConfig();
		$this->appConfig->owner->email = 'test@email.com';

		$this->mockRecaptchaService->method('ValidateRequest')->willReturn(true);
		$this->mockEmailService->expects($this->once())->method('Send')->willReturn(false);

		$result = $this->controller->Send($this->testContactForm);

		$this->assertInstanceOf(CustomResult::class , $result);
		$this->assertEquals(500, $result->StatusCode());

	}

	public function testContactController_SendPOSTReturnsOkResultIfSendingMailSucceeds()
	{
		$this->ctx->RequestMethod = 'POST';

		$this->appConfig->owner = new OwnerAppConfig();
		$this->appConfig->owner->email = 'test@email.com';

		$this->mockRecaptchaService->method('ValidateRequest')->willReturn(true);
		$this->mockEmailService->expects($this->once())->method('Send')->willReturn(true);

		$result = $this->controller->Send($this->testContactForm);

		$this->assertInstanceOf(OkResult::class , $result);
		$this->assertEquals(200, $result->StatusCode());

	}

}