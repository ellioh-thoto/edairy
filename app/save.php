<?php

try {
    $curl_post_data = array(
        '__filename__' => $_POST['__filename__'],
        '__title__'    => $_POST['__title__'],
        'main-content' => $_POST['main-content'],
    );
    $service_url = 'http://ediary:8080/save-my-page';
    ob_start();
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_URL, $service_url);

    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);

    $curl_response = curl_exec($curl);

    if ($curl_response === false) {
        $info = curl_getinfo($curl);
        curl_close($curl);
        die('error occured during curl exec. Additioanl info: ' . var_export($info));
    }
    curl_close($curl);
    $decoded = json_decode($curl_response);
    if (isset($decoded->response->status) && $decoded->response->status == 'ERROR') {
        die('error occured: ' . $decoded->response->errormessage);
    }
    echo 'response ok!';
    var_export($decoded->response);
    ob_end_clean();
}catch(Exception $e) {
    var_dump($e);
}