<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';
require_once __DIR__ . '/../Models/includes.php';
require_once __DIR__ . '/../Services/includes.php';

class UserController extends ControllerBase
{
	public function __construct(private RecaptchaService $recaptcha,
	 private AuthorisationService $auth,
	 private UserManagementService $userService,
	 ControllerContext $ctx)
	{
		parent::__construct($ctx);
	}

	#[HttpMethods(['POST'])]
	public function Add(NewUserFormModel $formModel): IResult
	{
		if(!$this->auth->IsAuthorised()) 
			return $this->Unauthorised();

		if(!$this->recaptcha->ValidateRequest($formModel->recaptchaToken)) {
			return $this->BadRequest();
		}

		if($this->userService->Exists($formModel->email, 'Email') !== null) {
			return $this->BadRequest();
		}

		$newUser = $this->userService->AddUser($formModel);
		if($newUser === null) { 
			return new CustomResult(500, 'An Error Occured Adding User');
		}

		$mapper = new Mapper(UserModel::class);
		return $this->Ok($mapper->map($newUser));
	}

	#[HttpMethods(['GET'])]
	public function List(): IResult
	{
		if (!$this->auth->IsAuthorised())
			return $this->Unauthorised();

		$outData = [];
		$mapper = new Mapper(UserModel::class);
		$users = $this->userService->ListUsers();
		foreach($users as $user) {
			$outData[] = $mapper->map($user);
		}

		return $this->Ok($outData);
	}

	#[HttpMethods(['POST'])]
	public function Update(UpdateUserFormModel $formModel): IResult
	{
		if(!$this->auth->IsAuthorised())
			return $this->Unauthorised();

		if (!$this->recaptcha->ValidateRequest($formModel->recaptchaToken)) {
			return $this->BadRequest();
		}

		if ($this->userService->Exists($formModel->email, 'Email') === null) {
			return $this->BadRequest();
		}

		$updatedUser = $this->userService->UpdateUser($formModel);
		if($updatedUser === null) {
			return new CustomResult(500, 'An Error Occured Updating User');
		}

		$mapper = new Mapper(UserModel::class);
		return $this->Ok($mapper->map($updatedUser));
	}

	#[HttpMethods(['POST'])]
	public function Delete(DeleteUserFormModel $formModel): IResult
	{
		if(!$this->auth->IsAuthorised()) {
			return $this->Unauthorised();
		}

		//Stop bad actors deleting SU
		if($formModel->id === 1 || $this->auth->GetAuthorisedUser()->Id === $formModel->id) {
			return $this->BadRequest();
		}

		if (!$this->recaptcha->ValidateRequest($formModel->recaptchaToken)) {
			return $this->BadRequest();
		}

		$this->userService->DeleteUser($formModel->id);

		return $this->Ok();
	}

}
