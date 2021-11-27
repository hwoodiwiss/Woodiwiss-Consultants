<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';
require_once __DIR__ . '/../Models/includes.php';


class UsersContext extends DbTableContext
{

	public function __construct(Db $db)
	{

		parent::__construct($db, User::class);
	}

}