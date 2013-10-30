<?php

function decodeJson($setid,$extras) {
		$flickrapi = 'http://api.flickr.com/services/rest/';
		$apikey = '27e559c055d6baf4e5085db5985cf121';
        $fullurl = $flickrapi . '?format=json&nojsoncallback=1&method=flickr.photosets.getPhotos&photoset_id=' . $setid . '&api_key=' . $apikey . '&extras=' . $extras;
        $flickr_json = file_get_contents($fullurl);
        $cjl_flickr = json_decode($flickr_json);
        return displaySet($cjl_flickr,$extras);
}


function displaySet($fjson,$extras) {
	$response = $fjson->photoset->photo;
	$html .= '<section id="gallerygrid">';
	foreach($response as $r) {
		$html .= '<img src="' . $r->$extras . '" />';
	}
	$html .= '</section>';
	return $html;
}

/*
function displaySet($fjson,$extras) {
	$response = $fjson->photoset->photo;
	foreach($response as $r) {
		$imgurl = $r->$extras;
		$photo = wp_remote_retrieve_body($imgurl);
		$attachment = wp_upload_bits(basename($imgurl),null,$photo);
		$wp_filetype = wp_check_filetype(basename($imgurl), null );
		$wp_upload_dir = wp_upload_dir();
		$postinfo = array(
		 //'guid' => $wp_upload_dir['url'] . '/' . basename( $imgurl ), 
		 'post_mime_type' => $wp_filetype['type'],
		 'post_title' => preg_replace('/\.[^.]+$/', '', basename($imgurl)),
		 'post_content' => '',
		 'post_status' => 'inherit'
		);
		$attach_id = wp_insert_attachment( $postinfo, $imgurl );
		require_once(ABSPATH . 'wp-admin/includes/image.php');
		$attach_data = wp_generate_attachment_metadata( $attach_id, $imgurl );
		wp_update_attachment_metadata( $attach_id, $attach_data );
	}
}
*/

?>


