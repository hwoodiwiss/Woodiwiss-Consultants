<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/Interface/IResult.php';

class NoDataResult implements IResult
{
	public function __construct()
	{
	}

	/**
	 * function StatusCode
	 *
	 * @return int Status Code to send to user
	 */
	function StatusCode(): int
	{
		return 204;
	}

	/**
	 * function Body
	 *
	 * @return string|null Data to return to the user
	 */
	function Body(): ?string
	{
		return null;
	}
}