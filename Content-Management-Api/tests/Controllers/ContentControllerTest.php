<?php

require_once __DIR__ . '/../../src/Controllers/ContentController.php';

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;
use WoodiwissConsultants\ContentController;
use WoodiwissConsultants\ContactFormModel;
use WoodiwissConsultants\AppConfig;
use WoodiwissConsultants\RecaptchaService;
use WoodiwissConsultants\Mapper;
use WoodiwissConsultants\ContentManagementService;
use WoodiwissConsultants\AuthorisationService;
use WoodiwissConsultants\ControllerContext;
use WoodiwissConsultants\OkResult;
use WoodiwissConsultants\NotFoundResult;
use WoodiwissConsultants\BadRequestResult;
use WoodiwissConsultants\User;
use WoodiwissConsultants\UnauthorisedResult;
use WoodiwissConsultants\ContentModel;
use WoodiwissConsultants\UpdateContentModel;

class ContentControllerTest extends TestCase
{
	private ControllerContext $ctx;
	private ContentController $controller;
	private MockObject $mockRecaptchaService;
	private MockObject $mockAuthService;
	private MockObject $mockContentService;
	private AppConfig $appConfig;
	private ContactFormModel $testContactForm;

	protected function setUp(): void
	{
		$this->ctx = new ControllerContext();
		$this->appConfig = new AppConfig();

		$this->mockRecaptchaService = $this->createMock(RecaptchaService::class);
		$this->mockContentService = $this->createMock(ContentManagementService::class);
		$this->mockAuthService = $this->createMock(AuthorisationService::class);
		$this->controller = new ContentController($this->mockContentService, $this->mockAuthService, $this->mockRecaptchaService, $this->ctx);
		$this->testContactForm = (new Mapper(ContactFormModel::class))->map(json_decode(file_get_contents(__DIR__ . '/../TestData/TestContactForm.json')));

	}

	public function testContactController_CtorCanConstruct()
	{
		$ctx = new ControllerContext();
		$this->assertInstanceOf(ContentController::class , new ContentController($this->mockContentService, $this->mockAuthService, $this->mockRecaptchaService, $this->ctx));
	}

	public function testContactController_Get_ReturnsNotFoundIfContentIsNull()
	{
		$this->mockContentService->expects($this->once())->method('GetContent')->willReturn(null);
		$actual = $this->controller->Get(5);
		$this->assertInstanceOf(NotFoundResult::class , $actual);
	}

	public function testContactController_Get_ReturnsResultOfGetContentIfFound()
	{
		$result = new ContentModel();
		$result->Content = 'lol';
		$this->mockContentService->expects($this->once())->method('GetContent')->willReturn($result);
		$actual = $this->controller->Get(5);
		$this->assertInstanceOf(OkResult::class , $actual);
		$this->assertEquals(json_encode($result), $actual->body());
	}

	public function testContactController_Update_ReturnsUnauthorisedIfNotLoggedIn()
	{
		$model = new UpdateContentModel();
		$this->mockAuthService->expects($this->once())->method('IsAuthorised')->willReturn(false);
		$this->mockRecaptchaService->expects($this->never())->method('ValidateRequest');
		$this->mockContentService->expects($this->never())->method('UpsertContent');
		$actual = $this->controller->Update($model);
		$this->assertInstanceOf(UnauthorisedResult::class , $actual);
	}

	public function testContactController_Update_ReturnsBadRequestIfRecaptchaFails()
	{
		$model = new UpdateContentModel();
		$model->recaptchaToken = 'token';
		$this->mockAuthService->expects($this->once())->method('IsAuthorised')->willReturn(true);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(false);
		$this->mockContentService->expects($this->never())->method('UpsertContent');
		$actual = $this->controller->Update($model);
		$this->assertInstanceOf(BadRequestResult::class , $actual);
	}

	public function testContactController_Update_ReturnsInternalServerErrorIfUserIsNull()
	{
		$model = new UpdateContentModel();
		$model->recaptchaToken = 'token';
		$this->mockAuthService->expects($this->once())->method('IsAuthorised')->willReturn(true);
		$this->mockAuthService->expects($this->once())->method('GetAuthorisedUser')->willReturn(null);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockContentService->expects($this->never())->method('UpsertContent')->willReturn(false);
		$actual = $this->controller->Update($model);
		$this->assertEquals(500, $actual->StatusCode());
	}

	public function testContactController_Update_ReturnsInternalServerErrorIfUpsertFails()
	{
		$model = new UpdateContentModel();
		$model->recaptchaToken = 'token';

		$user = new User();

		$this->mockAuthService->expects($this->once())->method('IsAuthorised')->willReturn(true);
		$this->mockAuthService->expects($this->once())->method('GetAuthorisedUser')->willReturn($user);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockContentService->expects($this->once())->method('UpsertContent')->willReturn(false);
		$actual = $this->controller->Update($model);
		$this->assertEquals(500, $actual->StatusCode());
	}

	public function testContactController_Update_ReturnsOkResultIfUpsertSucceeds()
	{
		$model = new UpdateContentModel();
		$model->recaptchaToken = 'token';

		$user = new User();

		$this->mockAuthService->expects($this->once())->method('IsAuthorised')->willReturn(true);
		$this->mockAuthService->expects($this->once())->method('GetAuthorisedUser')->willReturn($user);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockContentService->expects($this->once())->method('UpsertContent')->willReturn(true);
		$actual = $this->controller->Update($model);
		$this->assertInstanceOf(OkResult::class , $actual);
	}


}