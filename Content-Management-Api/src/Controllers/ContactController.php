<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';
require_once __DIR__ . '/../Models/includes.php';
require_once __DIR__ . '/../Services/includes.php';

class ContactController extends ControllerBase
{

	public function __construct(private AppConfig $config, private RecaptchaService $recaptcha, private EmailService $mail, ControllerContext $ctx) {
		parent::__construct($ctx);
	}

	#[HttpMethods(['POST'])]
	public function Send(ContactFormModel $formModel): IResult
	{
		if(!$this->recaptcha->ValidateRequest($formModel->recaptchaToken)) {
			return $this->BadRequest();
		}

		$message = "Message from $formModel->name" . ($formModel->organisation != null ? " from $formModel->organisation" : '') . ":\r\n$formModel->message \r\nReply address: $formModel->email";

		if(!$this->mail->Send($this->config->owner->email, "Message to Woodiwiss Consultants from $formModel->name", $message)){
			return new CustomResult(500, 'Could not send message.');
		};

		return $this->Ok();
	}
}
