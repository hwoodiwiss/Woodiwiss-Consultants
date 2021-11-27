<?php

foreach (glob(__DIR__ . '/*Result.php') as $include) {
	include_once $include;
}