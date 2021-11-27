<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/Interface/IResult.php';

class CustomResult implements IResult
{
	public function __construct(private int $StatusCode, private string $Body)
	{

	}

	/**
	 * function StatusCode
	 *
	 * @return int Status Code to send to user
	 */
	function StatusCode(): int
	{
		return $this->StatusCode;
	}

	/**
	 * function Body
	 *
	 * @return string|null Data to return to the user
	 */
	function Body(): ?string
	{
		return $this->Body;
	}
}