<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/Interface/IResult.php';

class NotSupportedResult implements IResult
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
		return 405;
	}

	/**
	 * function Body
	 *
	 * @return string Data to return to the user
	 */
	function Body(): string
	{
		return 'Method Not Allowed';
	}
}