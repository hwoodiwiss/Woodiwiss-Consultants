<?php

require_once __DIR__ . '/../../src/Controllers/AccountController.php';

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;
use WoodiwissConsultants\AccountController;
use WoodiwissConsultants\RecaptchaService;
use WoodiwissConsultants\AuthorisationService;
use WoodiwissConsultants\ControllerContext;
use WoodiwissConsultants\LoginFormModel;
use WoodiwissConsultants\DbTableContext;
use WoodiwissConsultants\OkResult;
use WoodiwissConsultants\UnauthorisedResult;
use WoodiwissConsultants\BadRequestResult;
use WoodiwissConsultants\RecaptchaResponse;
use WoodiwissConsultants\User;
use WoodiwissConsultants\UserModel;
use WoodiwissConsultants\Mapper;

class AccountControllerTest extends TestCase
{
	private ControllerContext $ctx;
	private AccountController $controller;
	private MockObject $mockRecaptchaService;
	private MockObject $mockAuthService;
	private MockObject $mockDbTableContext;
	private LoginFormModel $testLoginForm;
	private RecaptchaResponse $recaptchaSuccessResponse;

	protected function setUp(): void
	{
		$this->ctx = new ControllerContext();
		$this->recaptchaSuccessResponse = new RecaptchaResponse();
		$this->recaptchaSuccessResponse->success = true;
		$this->recaptchaSuccessResponse->score = 0.9;

		$this->mockRecaptchaService = $this->createMock(RecaptchaService::class);
		$this->mockAuthService = $this->createMock(AuthorisationService::class);
		$this->mockDbTableContext = $this->createMock(DbTableContext::class);
		$this->controller = new AccountController($this->mockRecaptchaService, $this->mockAuthService, $this->ctx);
		$loginFormContent = json_decode(file_get_contents(__DIR__ . '/../TestData/TestLoginForm.json'));
		$this->testLoginForm = (new Mapper(LoginFormModel::class))->map($loginFormContent);

	}

	public function testAccountController_CtorCanConstruct()
	{
		$ctx = new ControllerContext();
		$this->assertInstanceOf(AccountController::class , new AccountController($this->mockRecaptchaService, $this->mockAuthService, $this->ctx));
	}

	public function testAccountController_LogoutCallsDeauthoriseOnAuthService()
	{
		$this->mockAuthService->expects($this->once())->method('Deauthorise');
		$this->controller->Logout();
	}

	public function testAccountController_LogoutReturnsOkResult()
	{
		$result = $this->controller->Logout();
		$this->assertInstanceOf(OkResult::class , $result);
	}

	public function testAccountController_RefreshReturnsOkIfIsAuthorised()
	{
		$this->mockAuthService->expects($this->once())->method('IsAuthorised')->willReturn(true);
		$result = $this->controller->Refresh();
		$this->assertInstanceOf(OkResult::class , $result);
	}

	public function testAccountController_RefreshReturnsUnauthorisedIfNotIsAuthorised()
	{
		$this->mockAuthService->expects($this->once())->method('IsAuthorised')->willReturn(false);
		$result = $this->controller->Refresh();
		$this->assertInstanceOf(UnauthorisedResult::class , $result);
	}


	public function testAccountController_LoginPOSTReturns400IfRecaptchaFails()
	{
		$this->ctx->RequestMethod = 'POST';

		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(false);

		$result = $this->controller->Login($this->testLoginForm);

		$this->assertInstanceOf(BadRequestResult::class , $result);

	}

	public function testAccountController_LoginPOSTReturns401IfAuthoriseIsFalse()
	{
		$this->ctx->RequestMethod = 'POST';

		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockAuthService->expects($this->once())->method('Authorise')->willReturn(false);

		$result = $this->controller->Login($this->testLoginForm);

		$this->assertInstanceOf(UnauthorisedResult::class , $result);
	}

	public function testAccountController_LoginPOSTReturns200IfAuthoriseIsTrue()
	{
		$this->ctx->RequestMethod = 'POST';
		$userDbObject = new User($this->mockDbTableContext, ["Id" => 1,
			"Email" => "Test.User@Test.com",
			"FirstName" => "Test",
			"LastName" => "User",
			"PassHash" => "SomeStuff",
			"PassSalt" => "SomeMoreStuff"]);
		$userModelMapper = new Mapper(UserModel::class);

		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockAuthService->expects($this->once())->method('Authorise')->willReturn(true);
		$this->mockAuthService->expects($this->once())->method('GetAuthorisedUser')->willReturn($userDbObject);

		$result = $this->controller->Login($this->testLoginForm);

		$expectedModel = $userModelMapper->map($userDbObject);
		$this->assertInstanceOf(OkResult::class , $result);
		$this->assertEquals(json_encode($expectedModel), $result->Body());
	}



}