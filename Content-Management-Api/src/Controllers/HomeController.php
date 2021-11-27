<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';

class HomeController extends ControllerBase
{
	#[HttpMethods(['GET'])]
	public function Echo(): IResult
	{
		return $this->Ok((new \DateTime('now', new \DateTimeZone('UTC'))));
	}
}
