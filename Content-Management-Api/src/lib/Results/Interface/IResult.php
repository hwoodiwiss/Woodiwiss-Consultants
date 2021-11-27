<?php

namespace WoodiwissConsultants;

interface IResult
{
	/**
	 * function StatusCode
	 * 
	 * @return int Status Code to send to user
	 */
	public function StatusCode(): int;

	/**
	 * function Body
	 * 
	 * @return string|null Data to return to the user
	 */
	public function Body(): ?string;
}
