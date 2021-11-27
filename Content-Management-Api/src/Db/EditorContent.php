<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';

class EditorContent extends DbData
{
	public int $Id;
	public string $ContentId;
	public int $LastModifiedBy;
	public string $LastModifiedDate;
	public string $Content;
}