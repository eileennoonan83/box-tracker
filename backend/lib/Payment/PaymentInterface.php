<?php

namespace Estimator\Payment;

interface PaymentInterface {

    const TRANSACTION_TYPE_PURCHASE = '00';
    const TRANSACTION_TYPE_REFUND = '04';
    const TRANSACTION_TYPE_PREAUTHORIZE_ONLY = '05';

    /**
     * @return $this
     */
    public function sendPayment();

    /**
     * @return $this
     */
    public function issueRefund();

    /**
     * @return FirstDataResponse
     */
    public function getResponse();

    /**
     * @return $this
     */
    public function preAuthorizeCard();

    /**
     * @param $cc_number
     * @return $this
     */
    public function setCCNumber($cc_number);

    /**
     * @param $cc_name
     * @return $this
     */
    public function setCCName($cc_name);

    /**
     * @param $cc_expires
     * @return $this
     */
    public function setCCExpires($cc_expires);

    /**
     * @param $amount
     * @return $this
     */
    public function setAmount($amount);

    /**
     * @param $card
     * @return $this
     */
    public function setCard($card);

    /**
     * @param RecurringChargeCard $card
     * @return $this
     */
    public function setRecurringPaymentCard(RecurringChargeCard $card);

    /**
     * @param string $type
     * @return $this
     */
    public function setCcType($type);

    /**
     * @param $token
     * @return $this
     */
    public function setRecurringPaymentToken($token);
    /**
     * @param $cvv
     * @return $this
     */
    public function setCvv($cvv);

    /**
     * @param $billing_name
     * @return $this
     */
    public function setBillingName($billing_name);

    /**
     * @param $address_1
     * @return $this
     */
    public function setAddress1($address_1);

    /**
     * @param $address_2 
     * @return $this
     */
    public function setAddress2($address_2);

    /**
     * @param $city 
     * @return $this
     */
    public function setCity($city);

    /**
     * @param $state 
     * @return $this
     */
    public function setState($state);

    /**
     * @param $zip 
     * @return $this
     */
    public function setZip($zip);

    /**
     * @param $country
     * @return $this
     */
    public function setCountry($country);

    /**
     * @param ChargeDescriptionCollection $for 
     * @return $this 
     */
    public function setFor(ChargeDescriptionCollection $for);


        
}