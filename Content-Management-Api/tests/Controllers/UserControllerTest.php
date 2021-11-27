<?php

require_once __DIR__ . '/../../src/Controllers/UserController.php';

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;
use WoodiwissConsultants\UserController;
use WoodiwissConsultants\RecaptchaService;
use WoodiwissConsultants\AuthorisationService;
use WoodiwissConsultants\ControllerContext;
use WoodiwissConsultants\DbTableContext;
use WoodiwissConsultants\OkResult;
use WoodiwissConsultants\CustomResult;
use WoodiwissConsultants\UnauthorisedResult;
use WoodiwissConsultants\BadRequestResult;
use WoodiwissConsultants\UserManagementService;
use WoodiwissConsultants\User;
use WoodiwissConsultants\UserModel;
use WoodiwissConsultants\Mapper;
use WoodiwissConsultants\NewUserFormModel;
use WoodiwissConsultants\UpdateUserFormModel;
use WoodiwissConsultants\DeleteUserFormModel;

class UserControllerTest extends TestCase
{
	private ControllerContext $ctx;
	private UserController $controller;
	private MockObject $mockRecaptchaService;
	private MockObject $mockAuthService;
	private MockObject $mockUserManagementService;
	private MockObject $mockDbTableContext;
	private User $userDbObject;
	private UpdateUserFormModel $testUpdateUser;
	private NewUserFormModel $testNewUser;

	protected function setUp(): void
	{
		$this->ctx = new ControllerContext();

		$this->mockRecaptchaService = $this->createMock(RecaptchaService::class);
		$this->mockAuthService = $this->createMock(AuthorisationService::class);
		$this->mockDbTableContext = $this->createMock(DbTableContext::class);
		$this->mockUserManagementService = $this->createMock(UserManagementService::class);
		$this->controller = new UserController($this->mockRecaptchaService, $this->mockAuthService, $this->mockUserManagementService, $this->ctx);
		$testNewUserJson = file_get_contents(__DIR__ . '/../TestData/TestNewUserForm.json');
		$testUpdateUserJson = file_get_contents(__DIR__ . '/../TestData/TestUpdateUserForm.json');

		$this->testNewUser = (new Mapper(NewUserFormModel::class))->map(json_decode($testNewUserJson));
		$this->testUpdateUser = (new Mapper(UpdateUserFormModel::class))->map(json_decode($testUpdateUserJson));

		$this->userDbObject = new User($this->mockDbTableContext, ["Id" => 1,
			"Email" => "Test.User@Test.com",
			"FirstName" => "Test",
			"LastName" => "User",
			"PassHash" => "SomeStuff",
			"PassSalt" => "SomeMoreStuff"]);

	}

	public function testUserController_CtorCanConstruct()
	{
		$ctx = new ControllerContext();
		$this->assertInstanceOf(UserController::class , new UserController($this->mockRecaptchaService, $this->mockAuthService, $this->mockUserManagementService, $this->ctx));
	}

	public function testUserController_AddReturnsUnauthorisedIfNotAuthroised()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(false);
		$result = $this->controller->Add($this->testNewUser);
		$this->assertInstanceOf(UnauthorisedResult::class , $result);
	}

	public function testUserController_UpdateReturnsUnauthorisedIfNotAuthroised()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(false);
		$result = $this->controller->Update($this->testUpdateUser);
		$this->assertInstanceOf(UnauthorisedResult::class , $result);
	}

	public function testUserController_AddReturnsBadRequestIfRecaptchaFails()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(false);

		$result = $this->controller->Add($this->testNewUser);
		$this->assertInstanceOf(BadRequestResult::class , $result);
	}

	public function testUserController_UpdateReturnsBadRequestIfRecaptchaFails()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(false);

		$result = $this->controller->Update($this->testUpdateUser);
		$this->assertInstanceOf(BadRequestResult::class , $result);
	}

	public function testUserController_DeleteReturnsBadRequestIfRecaptchaFails()
	{
		$user = new User;
		$user->Id = 5001;

		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockAuthService->expects($this->once())
			->method('GetAuthorisedUser')
			->willReturn($user);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(false);

		$model = new DeleteUserFormModel;
		$model->recaptchaToken = '';
		$model->id = 500;
		$result = $this->controller->Delete($model);
		$this->assertInstanceOf(BadRequestResult::class , $result);
	}

	public function testUserController_AddReturnsErrorIfAddFails()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockUserManagementService->expects($this->once())->method('AddUser')->willReturn(null);

		$result = $this->controller->Add($this->testNewUser);
		$this->assertInstanceOf(CustomResult::class , $result);
		$this->assertEquals(500, $result->StatusCode());
	}

	public function testUserController_UpdateReturnsErrorIfUpdateFails()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockUserManagementService->expects($this->once())->method('Exists')->willReturn($this->userDbObject);
		$this->mockUserManagementService->expects($this->once())->method('UpdateUser')->willReturn(null);

		$result = $this->controller->Update($this->testUpdateUser);
		$this->assertInstanceOf(CustomResult::class , $result);
		$this->assertEquals(500, $result->StatusCode());
	}

	public function testUserController_AddReturnsAddedUserIfAddSucceeds()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockUserManagementService->expects($this->once())->method('Exists')->willReturn(null);
		$this->mockUserManagementService->expects($this->once())->method('AddUser')->willReturn($this->userDbObject);

		$result = $this->controller->Add($this->testNewUser);
		$mapper = new Mapper(UserModel::class);

		$this->assertInstanceOf(OkResult::class , $result);
		$this->assertEquals(json_encode($mapper->map($this->userDbObject)), $result->Body());
	}

	public function testUserController_UpdateReturnsUpdatedUserIfUpdateSucceeds()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockRecaptchaService->expects($this->once())->method('ValidateRequest')->willReturn(true);
		$this->mockUserManagementService->expects($this->once())->method('Exists')->willReturn($this->userDbObject);
		$this->mockUserManagementService->expects($this->once())->method('UpdateUser')->willReturn($this->userDbObject);
		$mapper = new Mapper(UserModel::class);


		$result = $this->controller->Update($this->testUpdateUser);
		$this->assertInstanceOf(OkResult::class , $result);
		$this->assertEquals(json_encode($mapper->map($this->userDbObject)), $result->Body());
	}

	public function testUserController_DeleteReturnsUnauthorisedIfNotAuthroised()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(false);

		$model = new DeleteUserFormModel;

		$result = $this->controller->Delete($model);
		$this->assertInstanceOf(UnauthorisedResult::class , $result);
	}

	public function testUserController_DeleteReturnsBadRequestIfIdIsSU()
	{
		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$model = new DeleteUserFormModel;
		$model->id = 1;
		$result = $this->controller->Delete($model);
		$this->assertInstanceOf(BadRequestResult::class , $result);

	}

	public function testUserController_DeleteReturnsBadRequestIfIdIsCurrentUser()
	{
		$user = new User;
		$user->Id = 55;

		$this->mockAuthService->expects($this->once())
			->method('IsAuthorised')
			->willReturn(true);
		$this->mockAuthService->expects($this->once())
			->method('GetAuthorisedUser')
			->willReturn($user);

		$model = new DeleteUserFormModel;
		$model->id = 55;
		$result = $this->controller->Delete($model);
		$this->assertInstanceOf(BadRequestResult::class , $result);

	}


}