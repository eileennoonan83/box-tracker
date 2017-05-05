<?php namespace Estimator\Payment;

class ChargeDescription
{

    public
        $name,
        $amount,
        $description;

    /**
     * @var array
     */
    public $itemized = [];

    /**
     * ChargeDescription constructor
     * @param string $name
     * @param string|integer $amount
     * @param string $description
     * @param array $itemized
     */
    public function __construct($name, $amount, $description, array $itemized = [])
    {
        $this->name = $name;
        $this->amount = (int) $amount;
        $this->description = $description;
        $this->itemized = $itemized;
    }

    public function __get($key)
    {
        // want the option to store JSON here
        if ($key === 'description') {
            $decoded = json_decode($this->description);
            if ($decoded === NULL) {
                return $this->description;
            }
            return $decoded;
        }

        return $this->{$key};
    }
}