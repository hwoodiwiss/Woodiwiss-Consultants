<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';
require_once __DIR__ . '/../Models/includes.php';


class EditorContentContext extends DbTableContext
{

	public function __construct(Db $db)
	{

		parent::__construct($db, EditorContent::class , 'EditorContent');
	}

}