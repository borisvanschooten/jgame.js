<?php

//http://maettig.com/?page=PHP/imageflip
function myimageflip(&$image, $x = 0, $y = 0, $width = null, $height = null) {
    if ($width  < 1) $width  = imagesx($image);
    if ($height < 1) $height = imagesy($image);
    $ret = imagecreatetruecolor($width, $height);
	imagesavealpha($ret, true);
	imagealphablending($ret, false);
    $x2 = $x + $width - 1;
    for ($i=0; $i<$width; $i++) {
        imagecopy($ret, $image, $x2 - $i, $y, $x + $i,  $y, 1, $height);
    }
	return $ret;
}




$url = $_GET['url'];

// get square image
list($widthorig,$heightorig) = getimagesize($url);
$imgorig = imagecreatefrompng($url);
imagesavealpha($imgorig, true);
if ($widthorig > $heightorig) {
	$width = $widthorig;
	$height = $widthorig;
} else {
	$width = $heightorig;
	$height = $heightorig;
}
// create destination image
$img = imagecreatetruecolor($width,$height);
imagealphablending($img, false);
imagesavealpha($img, true);
imagecopy ($img, $imgorig, /*dst*/ 0,0, /* src */ 0,0, $widthorig,$heightorig);
imagedestroy($imgorig);

// paste transformed images onto destination image
$retimg = imagecreatetruecolor(3*$width,3*$height);
imagesavealpha($retimg, true);
imagealphablending($retimg, false);

imagecopy ($retimg, $img, /*dst*/ 0,0, /* src */ 0,0, $width,$height);

$img90 = imagerotate($img,270,0);
imagecopy ($retimg, $img90, /*dst*/ $width,0, /* src */ 0,0, $width,$height);
imagedestroy($img90);

$img180 = imagerotate($img,180,0);
imagecopy ($retimg, $img180, /*dst*/ 2*$width,0, /* src */ 0,0, $width,$height);
imagedestroy($img180);

$img270 = imagerotate($img,90,0);
imagecopy ($retimg, $img270, /*dst*/ 0,$height, /* src */ 0,0, $width,$height);
imagedestroy($img270);

$imgflip = myimageflip($img);
imagecopy ($retimg, $imgflip, /*dst*/ $width,$height, /* src */ 0,0, $width,$height);

$img90 = imagerotate($imgflip,270,0);
imagecopy ($retimg, $img90, /*dst*/ 2*$width,$height, /* src */ 0,0, $width,$height);
imagedestroy($img90);

$img180 = imagerotate($imgflip,180,0);
imagecopy ($retimg, $img180, /*dst*/ 0,2*$height, /* src */ 0,0, $width,$height);
imagedestroy($img180);

$img270 = imagerotate($imgflip,90,0);
imagecopy ($retimg, $img270, /*dst*/ $width,2*$height, /* src */ 0,0, $width,$height);
imagedestroy($img270);

imagedestroy($imgflip);
imagedestroy($img);


header ('Content-Type: image/png');

imagepng($retimg,null,9,PNG_ALL_FILTERS);

imagedestroy($retimg);


?>
