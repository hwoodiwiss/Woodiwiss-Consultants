<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/Interface/IResult.php';

class BadRequestResult implements IResult
{
	public function __construct(private ?string $message = null)
	{
	}

	/**
	 * function StatusCode
	 *
	 * @return int Status Code to send to user
	 */
	function StatusCode(): int
	{
		return 400;
	}

	/**
	 * function Body
	 *
	 * @return string|null Data to return to the user
	 */
	function Body(): ?string
	{
		return $this->message;
	}
}