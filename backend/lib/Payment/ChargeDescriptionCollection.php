<?php namespace Estimator\Payment;


use Estimator\Service\CollectionOf\CollectionOf;

class ChargeDescriptionCollection extends CollectionOf
{
    /**
     * The fully qualified namespace of the class
     * that this is a collection of
     * @var string
     */
    protected static $of_class = ChargeDescription::class;
}