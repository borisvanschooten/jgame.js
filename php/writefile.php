<?php

$filename = $_GET['file'];
$contents = file_get_contents('php://input');

$f = fopen("../games/$filename.txt","w") or die("Cannot open file");
fwrite($f,$contents);
fclose($f);
?>
