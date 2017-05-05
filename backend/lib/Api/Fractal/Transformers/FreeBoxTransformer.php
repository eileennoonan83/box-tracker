<?php namespace Estimator\Api\Fractal\Transformers;

use Box;
use Carbon\Carbon;
use CreditCard;
use Customer;
use Estimator\Service\Estimator\Boxes\Boxes;
use FreeBox;
use FreeBoxSupplies;
use Job;
use League\Fractal\TransformerAbstract;

class FreeBoxTransformer extends TransformerAbstract
{

    /**
     * @param FreeBox $free_box
     * @return array
     */
    public function transform(FreeBox $free_box)
    {
        $customer = $free_box->customer;
        $owner = $customer->owner;
        $data = [
            'id' => $free_box->getKey(),
            'status' => $free_box->status,
            'outBoxes' => $free_box->supplies_out,
            'scheduledReturnDate' => $this->dateFormat($free_box->scheduled_return_date),
            'actualReturnDate' => $this->dateFormat($free_box->actual_return_date),
            'pickupDate' => $this->dateFormat($free_box->pickup_date),
            'createdAt' => $this->dateFormat($free_box->created_at),
            'updatedAt' => $this->dateFormat($free_box->updated_at),
            'customer' => [
                'id' => $customer->id,
                'firstName' => $customer->first_name,
                'lastName' => $customer->last_name,
                'phone' => $customer->phone,
                'emailAddress' => $customer->email_address,
                'cards' => $this->formatCreditCards($customer),
                // TODO: set up a separate api call and only load the address
                // if they are entering a new credit card, seems
                // likely to be the less common scenario
                //'address' => $this->deriveLikelyAddress($customer)
            ],
            'owner' => [
                'id' => $owner->id,
                'firstName' => $owner->first_niame,
                'lastName' => $owner->last_name,
                'email' => $owner->email,
                'phone' => $owner->phone
            ]
        ];

        if ($free_box->include_options) {
            $data['options'] = FreeBoxSupplies::boxTrackerOptions();
        }
        return $data;
    }

    /**
     * @param $date
     * @return string
     */
    protected function dateFormat($date) {

        return (bool) strtotime($date)
            ? (new Carbon($date))->format('m/d/Y')
            : ''
        ;
    }

    /**
     * @param Customer $customer
     * @return array
     */
    protected function formatCreditCards(Customer $customer)
    {
        $result = [];
        $cards = $customer->creditCards;

        foreach($cards as $card) {
            $result[] = [
                'id' => $card->getKey(),
                'cardholderName' => $card->cardholder_name,
                'type' => $card->type,
                'expirationDate' => $card->expiration_date
            ];
        }

        return $result;
    }

    protected function deriveLikelyAddress(Customer $customer)
    {
        $from = $customer->likelyBillingLocation();
        if (!$from) {
            return null;
        }

        return [
            'address' => $from->address_1,
            'address2' => $from->address_2,
            'city' => $from->city,
            'state' => $from->state,
            'zip' => $from->zip,
            'country' => 'US'
        ];
    }
}