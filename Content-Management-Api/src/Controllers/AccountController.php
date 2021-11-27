<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';
require_once __DIR__ . '/../Models/includes.php';
require_once __DIR__ . '/../Services/includes.php';

class AccountController extends ControllerBase
{
	public function __construct(private RecaptchaService $recaptcha,
	 private AuthorisationService $auth,
	 ControllerContext $ctx)
	{
		parent::__construct($ctx);
	}

	#[HttpMethods(['POST'])]
	public function Logout(): IResult
	{
		$this->auth->Deauthorise();

		return $this->Ok();
	}

	#[HttpMethods(['POST'])]
	public function Refresh(): IResult
	{
		return $this->auth->IsAuthorised() ? $this->Ok() : $this->Unauthorised();
	}

	#[HttpMethods(['POST'])]
	public function Login(LoginFormModel $formModel): IResult
	{
		if (!$this->recaptcha->ValidateRequest($formModel->recaptchaToken)) {
			return $this->BadRequest();
		}

		if (!$this->auth->Authorise($formModel->email, 'Email', $formModel->password))
			return $this->Unauthorised();

		$user = $this->auth->GetAuthorisedUser();

		$modelMapper = new Mapper(UserModel::class);

		return $this->Ok($modelMapper->map($user));
	}
}