<?php

use Estimator\Commanding\CommandBus;
use Estimator\Payment\AddCreditCardToCustomerCommand;
use Estimator\Validating\ValidationFailedTrait;

class CustomerCreditCardApiController extends Controller
{
    use ValidationFailedTrait;


    /**
     * @var CommandBus
     */
    private $bus;


    /**
     * CustomerCreditCardApiController constructor.
     * @param CommandBus $bus
     */
    public function __construct(CommandBus $bus)
    {
        $this->bus = $bus;
    }

    /**
     * @param Customer $customer
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Customer $customer)
    {
        $card = request('card');

        $card['cardholder_name'] = isset($card['cardHolderName']) ? $card['cardHolderName']: '';
        $card['expiration_date'] = isset($card['expirationDate']) ? $card['expirationDate'] : '';
        $card['customer_id'] = $customer->getKey();
        unset($card['cardHolderName'], $card['expirationDate']);

        $command = new AddCreditCardToCustomerCommand(
            $customer,
            $card
        );

        $result = $this->bus->execute($command);
        if ($this->validationFailed($result)) {
            return $this->errorResponse($result->errors());
        }
        $card = $result->card;

        $response_data =
            [
                'card'=> [
                    'id' => $card->getKey(),
                    'customerId' => $card->customer_id,
                    'cardholderName' => $card->cardholder_name,
                    'type' => $card->type,
                    'expirationDate' => $card->expiration_date
                ]
            ];
        return response()->json($response_data);
    }

    /**
     * @param Customer $customer
     * @return \Illuminate\Http\JsonResponse
     */
    public function likelyBillingAddress(Customer $customer)
    {
        if ($location = $customer->likelyBillingLocation()) {
            $data = [
                'billingAddress' => [
                    'address' => $location->address_1,
                    'address2' => $location->address_2,
                    'city' => $location->city,
                    'state' => $location->state,
                    'zip' => $location->zip,
                    'country' => 'US'
                ]
            ];
            return response()->json($data, 200);
        } else {
            return response()->json(['billingAddress' => []]);
        }
    }

    /**
     * @param $errors
     * @return \Illuminate\Http\JsonResponse
     */
    protected function errorResponse($errors, $status = 400)
    {
        \Log::error(print_r($errors, true));
        return response()->json(compact('errors'), $status);
    }
}