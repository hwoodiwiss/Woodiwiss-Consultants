<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/Interface/IResult.php';

class UnauthorisedResult implements IResult
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
		return 401;
	}

	/**
	 * function Body
	 *
	 * @return string Data to return to the user
	 */
	function Body(): string
	{
		return 'Unauthorised';
	}
}