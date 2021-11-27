<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/../../lib/Results/Results.php';
include_once __DIR__ . '/ControllerContext.php';

abstract class ControllerBase
{
	public function __construct(protected ControllerContext $ctx)
	{

	}

	protected function SerializeBody(string $type): object|bool
	{
		if ($this->ctx->RequestBody === '')
			return false;

		$objectMapper = new Mapper($type);
		$object = $objectMapper->map(json_decode($this->ctx->RequestBody));

		if (!$objectMapper->getValidator()->validate($object))
			return false;

		return $object;
	}

	protected function Ok($data = null): OkResult
	{
		return new OkResult($data);
	}

	protected function NotFound(): NotFoundResult
	{
		return new NotFoundResult();
	}

	protected function NotSupported(): NotSupportedResult
	{
		return new NotSupportedResult();
	}

	protected function NoData(): NoDataResult
	{
		return new NoDataResult();
	}

	protected function BadRequest(?string $message = null): BadRequestResult
	{
		return new BadRequestResult($message);
	}

	protected function Redirect(string $uri, bool $permenant = false): RedirectResult
	{
		$this->ctx->responseHeaders['Location'] = $uri;
		return new RedirectResult($uri, $permenant);
	}

	protected function Unauthorised(): UnauthorisedResult
	{
		return new UnauthorisedResult();
	}
}