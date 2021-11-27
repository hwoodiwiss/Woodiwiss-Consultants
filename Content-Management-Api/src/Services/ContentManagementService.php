<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../AppConfig.php';
require_once __DIR__ . '/../lib/includes.php';


class ContentManagementService
{
	private Mapper $contentMapper;
	public function __construct(private EditorContentContext $content, private DateTimeProvider $dt)
	{
		$this->contentMapper = new Mapper(ContentModel::class);
	}

	public function GetContent(string $uuid): ?ContentModel
	{
		$matchingContent = $this->content->Select([], [new DbCondition('ContentId', $uuid)]);
		if (count($matchingContent) !== 1) {
			return null;
		}

		return $this->contentMapper->map($matchingContent[0]);
	}

	public function UpsertContent(UpdateContentModel $model, User $currentUser): bool
	{
		$matchingContent = $this->content->Select([], [new DbCondition('ContentId', $model->id)]);
		$count = count($matchingContent);
		if ($count === 0) {
			return $this->InsertContent($model, $currentUser);
		}
		else if ($count !== 1) {
			return false;
		}

		/** @var EditorContent */$contentObj = $matchingContent[0];
		$contentObj->Content = $model->content;
		$contentObj->LastModifiedBy = $currentUser->Id;
		$contentObj->LastModifiedDate = $this->dt->UTCNowString();
		try {
			$this->content->UpdateObj($contentObj);
			return true;
		}
		catch (\Exception $e) {
			return false;
		}
	}

	private function InsertContent(UpdateContentModel $model, User $currentUser): bool
	{

		$contentObj = new EditorContent();
		$contentObj->Content = $model->content;
		$contentObj->ContentId = $model->id;
		$contentObj->LastModifiedBy = $currentUser->Id;
		$contentObj->LastModifiedDate = $this->dt->UTCNowString();
		if (!$this->content->InsertObj($contentObj)) {
			return false;
		}

		return true;
	}
}