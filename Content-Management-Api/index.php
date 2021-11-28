<?php
//This "index.php" takes the place of our runtime environment

ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

require_once __DIR__ . '/vendor/autoload.php';

use WoodiwissConsultants\ContentManagementApi;

(new ContentManagementApi())->main();
