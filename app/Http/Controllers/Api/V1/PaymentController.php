<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Models\Transaction; // Will create model next

class PaymentController extends BaseApiController
{
    public function createIntent(Request $request)
    {
        // Simple validation
        $request->validate([
            'amount' => 'required|integer|min:100', // Amount in cents
            'currency' => 'required|string|size:3',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount,
                'currency' => $request->currency,
                'metadata' => [
                    'user_id' => $request->user()->id,
                ],
            ]);

            return $this->successResponse([
                'client_secret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Payment creation failed: ' . $e->getMessage(), 500);
        }
    }

    public function webhook(Request $request)
    {
        // In a real app, verify signature
        $payload = $request->all();
        $type = $payload['type'] ?? null;

        Log::info('Stripe Webhook Received: ' . $type);

        if ($type === 'payment_intent.succeeded') {
            $paymentIntent = $payload['data']['object'];
            // Handle successful payment
            // $this->storeTransaction(...)
        }

        return response()->json(['status' => 'success']);
    }
}
