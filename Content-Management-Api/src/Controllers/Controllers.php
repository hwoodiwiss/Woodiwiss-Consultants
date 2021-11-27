<?php

foreach (glob(__DIR__ . '/*Controller.php') as $include) {
	include_once $include;
}