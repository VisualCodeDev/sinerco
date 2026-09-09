<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public static function sendMessage(string $phoneNum, string $message): bool
    {
        $token = config('services.fonnte.token');
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://api.fonnte.com/send',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => [
                'target' => $phoneNum,
                'message' => $message,
            ],
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $token,
            ],
        ]);

        $response = curl_exec($curl);
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            Log::error('WhatsApp send failed (curl error): ' . $error_msg);
            curl_close($curl);
            return false;
        }
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        // Fonnte mengembalikan HTTP 200 meski gagal, statusnya ada di body JSON
        $body = json_decode($response, true);
        if ($httpCode >= 400 || (is_array($body) && array_key_exists('status', $body) && $body['status'] === false)) {
            Log::error('WhatsApp send failed (API error): ' . $response);
            return false;
        }

        return true;
    }
}

