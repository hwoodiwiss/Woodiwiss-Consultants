<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';
require_once __DIR__ . '/../Models/includes.php';
require_once __DIR__ . '/../Services/includes.php';

class ContentController extends ControllerBase
{

	public function __construct(private ContentManagementService $cms,
	 private AuthorisationService $auth,
	 private RecaptchaService $recaptcha,
	ControllerContext $ctx)
	{
		parent::__construct($ctx);
	}

	#[HttpMethods(['GET'])]
	public function Get(string $id): IResult
	{
		if($content = $this->cms->GetContent($id)) {
			return $this->Ok($content);
		}

		return $this->NotFound();
	}

	#[HttpMethods(['POST'])]
	public function Update(UpdateContentModel $model): IResult
	{
		if (!$this->auth->IsAuthorised()) {
			return $this->Unauthorised();
		}

		if (!$this->recaptcha->ValidateRequest($model->recaptchaToken)) {
			return $this->BadRequest();
		}

		$user = $this->auth->GetAuthorisedUser();

		if(!$user || !$this->cms->UpsertContent($model, $user)) {
			return new CustomResult(500, '');
		}

		return $this->Ok();
	}
}